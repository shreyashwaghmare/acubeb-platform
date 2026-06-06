import React, { useMemo, useState } from "react";
import { StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";
import { useAppContext } from "../../context/AppContext";

export default function MapViewScreen() {
  const [mapLoading, setMapLoading] = useState(true);
  const { tasks } = useAppContext();

  const sites = useMemo(() => {
    return tasks.map((task, index) => {
      const fallbackLat = 18.5204 + index * 0.05;
      const fallbackLng = 73.8567 + index * 0.05;
      const status = String(task.status || "").toUpperCase();

      return {
        requestNo: task.requestNo || "Request",
        project: task.project || "Project",
        site: task.site || "Site address pending",
        status,
        lat:
          task.site_latitude !== undefined && task.site_latitude !== null
            ? Number(task.site_latitude)
            : fallbackLat,
        lng:
          task.site_longitude !== undefined && task.site_longitude !== null
            ? Number(task.site_longitude)
            : fallbackLng,
      };
    });
  }, [tasks]);

  const testingCount = sites.filter((s) => s.status === "TESTING_IN_PROGRESS").length;
  const reportCount = sites.filter((s) => s.status === "REPORT_READY").length;
  const collectedCount = sites.filter((s) => s.status === "SAMPLE_COLLECTED").length;
  const labCount = sites.filter((s) => s.status === "LAB_RECEIVED").length;

  const leafletHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { margin: 0; padding: 0; background-color: #080808; }
        #map { height: 100vh; width: 100vw; background: #080808; }

        .leaflet-popup-content-wrapper {
          border-radius: 14px;
          background: #f7f7f7;
        }

        .custom-pin {
          border: 2px solid #050505;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          box-shadow: 0 0 18px rgba(212,175,55,0.8);
        }

        .pin-assigned { background-color: #D4AF37; }
        .pin-collected { background-color: #9C27B0; }
        .pin-lab { background-color: #2196F3; }
        .pin-testing { background-color: #FF9800; }
        .pin-report { background-color: #2E7D32; }

        .popup {
          font-family: -apple-system, BlinkMacSystemFont, Arial, sans-serif;
          min-width: 230px;
        }

        .req {
          font-size: 11px;
          font-weight: 900;
          color: #B08A18;
          margin-bottom: 5px;
        }

        .project {
          font-size: 15px;
          font-weight: 900;
          color: #111;
          margin-bottom: 6px;
        }

        .site {
          font-size: 12px;
          color: #333;
          line-height: 16px;
          margin-bottom: 10px;
        }

        .status {
          display: inline-block;
          font-size: 10px;
          font-weight: 900;
          background: #111;
          color: #D4AF37;
          padding: 6px 9px;
          border-radius: 7px;
          margin-bottom: 10px;
        }

        .routeBtn {
          display: block;
          text-decoration: none;
          background: #D4AF37;
          color: #000 !important;
          font-weight: 900;
          padding: 9px;
          text-align: center;
          border-radius: 9px;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>

      <script>
        var sites = ${JSON.stringify(sites)};
        var map = L.map('map', { zoomControl: false });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        function getPinClass(status) {
          if (status === "SAMPLE_COLLECTED") return "pin-collected";
          if (status === "LAB_RECEIVED") return "pin-lab";
          if (status === "TESTING_IN_PROGRESS") return "pin-testing";
          if (status === "REPORT_READY") return "pin-report";
          return "pin-assigned";
        }

        if (!sites || sites.length === 0) {
          map.setView([18.5204, 73.8567], 9);
        } else {
          var bounds = [];

          sites.forEach(function(site) {
            if (!site.lat || !site.lng || isNaN(site.lat) || isNaN(site.lng)) return;

            var markerIcon = L.divIcon({
              className: 'custom-pin ' + getPinClass(site.status),
              iconSize: [18, 18]
            });

            var cleanStatus = String(site.status || '').replaceAll('_', ' ');
            var mapsQuery = encodeURIComponent(site.site || site.project || '');

            var popupHtml =
              "<div class='popup'>" +
                "<div class='req'>" + site.requestNo + "</div>" +
                "<div class='project'>" + site.project + "</div>" +
                "<div class='site'>" + site.site + "</div>" +
                "<div class='status'>" + cleanStatus + "</div>" +
                "<a class='routeBtn' href='https://www.google.com/maps/search/?api=1&query=" + mapsQuery + "' target='_blank'>OPEN ROUTE</a>" +
              "</div>";

            L.marker([site.lat, site.lng], { icon: markerIcon })
              .addTo(map)
              .bindPopup(popupHtml);

            bounds.push([site.lat, site.lng]);
          });

          if (bounds.length === 0) {
            map.setView([18.5204, 73.8567], 9);
          } else if (bounds.length === 1) {
            map.setView(bounds[0], 12);
          } else {
            map.fitBounds(bounds, { padding: [40, 40] });
          }
        }
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <View style={styles.headerCompact}>
        <View>
          <Text style={styles.metaLabel}>LIVE FIELD MAP</Text>
          <Text style={styles.heading}>Explore</Text>
        </View>

        <View style={styles.activeBadge}>
          <Text style={styles.activeValue}>{tasks.length}</Text>
          <Text style={styles.activeLabel}>ACTIVE</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <Stat label="Collected" value={collectedCount} />
        <Stat label="Lab" value={labCount} />
        <Stat label="Testing" value={testingCount} />
        <Stat label="Reports" value={reportCount} />
      </View>

      <View style={styles.mapFrame}>
        <WebView
          originWhitelist={["*"]}
          source={{ html: leafletHTML }}
          style={styles.webview}
          onLoadEnd={() => setMapLoading(false)}
          javaScriptEnabled
          domStorageEnabled
        />

        {mapLoading && (
          <View style={styles.loaderOverlay}>
            <ActivityIndicator size="large" color="#D4AF37" />
            <Text style={styles.loaderText}>Syncing assigned sites...</Text>
          </View>
        )}
      </View>

      <View style={styles.legend}>
        <LegendDot color="#D4AF37" label="Assigned" />
        <LegendDot color="#9C27B0" label="Collected" />
        <LegendDot color="#2196F3" label="Lab" />
        <LegendDot color="#FF9800" label="Testing" />
        <LegendDot color="#2E7D32" label="Report" />
      </View>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statPill}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#080808" },

  headerCompact: {
    paddingTop: 58,
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: "#080808",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  metaLabel: {
    color: "#555",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 2,
  },

  heading: {
    color: "#D4AF37",
    fontSize: 30,
    fontWeight: "900",
    marginTop: 2,
  },

  activeBadge: {
    width: 72,
    height: 54,
    borderRadius: 14,
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#1C1C1C",
    alignItems: "center",
    justifyContent: "center",
  },

  activeValue: {
    color: "#D4AF37",
    fontSize: 20,
    fontWeight: "900",
  },

  activeLabel: {
    color: "#777",
    fontSize: 9,
    fontWeight: "900",
    marginTop: 1,
  },

  statsRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: "#080808",
  },

  statPill: {
    flex: 1,
    backgroundColor: "#111",
    borderColor: "#1C1C1C",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 9,
    alignItems: "center",
  },

  statValue: {
    color: "#D4AF37",
    fontSize: 16,
    fontWeight: "900",
  },

  statLabel: {
    color: "#777",
    fontSize: 9,
    fontWeight: "800",
    marginTop: 2,
  },

  mapFrame: {
    flex: 1,
    backgroundColor: "#080808",
    overflow: "hidden",
  },

  webview: {
    flex: 1,
    backgroundColor: "#080808",
  },

  legend: {
    backgroundColor: "#0C0C0C",
    borderTopWidth: 1,
    borderTopColor: "#1C1C1C",
    paddingVertical: 10,
    paddingHorizontal: 10,
    flexDirection: "row",
    justifyContent: "space-around",
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  legendText: {
    color: "#777",
    fontSize: 9,
    fontWeight: "800",
  },

  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#080808",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },

  loaderText: {
    color: "#444",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});