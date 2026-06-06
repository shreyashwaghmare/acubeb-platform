import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#D4AF37', // A Cube B Signature Executive Gold
        tabBarInactiveTintColor: '#555',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0C0C0C',
          borderTopWidth: 1,
          borderTopColor: '#161616',
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "list-circle" : "list-circle-outline"} size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "map" : "map-outline"} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
  name="profile"
  options={{
    title: "Profile",
    tabBarIcon: ({ color, focused }) => (
      <Ionicons
        name={focused ? "person-circle" : "person-circle-outline"}
        size={26}
        color={color}
      />
    ),
  }}
/>
    </Tabs>
  );
}