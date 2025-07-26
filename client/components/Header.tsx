"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { LogOut, User, Settings } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar_link?: string;
}

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  const API = "http://localhost:8000";

  useEffect(() => {
    const loadUser = async () => {
      try {
        const raw = localStorage.getItem("netzero_creds");
        if (!raw) {
          router.replace("/auth");
          return;
        }

        const creds = JSON.parse(raw);
        
        // Fetch user profile
        const response = await fetch(`${API}/profile/${creds.email}?password=${creds.password}`);
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          // If profile fetch fails, redirect to auth
          localStorage.removeItem("netzero_creds");
          router.replace("/auth");
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        localStorage.removeItem("netzero_creds");
        router.replace("/auth");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("netzero_creds");
    router.replace("/auth");
  };

  const handleProfile = () => {
    router.push("/profile");
    setShowDropdown(false);
  };

  if (loading) {
    return (
      <header className="flex h-16 items-center justify-between border-b bg-white px-6">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      </header>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      
      <div className="relative">
        <div 
          className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">{user.name}</div>
            <div className="text-xs text-gray-500">{user.email}</div>
          </div>
          
          {user.avatar_link ? (
            <Image
              src={user.avatar_link}
              alt={user.name}
              width={32}
              height={32}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Dropdown Menu */}
        {showDropdown && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setShowDropdown(false)}
            />
            
            {/* Dropdown */}
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border z-20">
              <div className="py-1">
                <button
                  onClick={handleProfile}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <User size={16} />
                  Profile
                </button>
                
                <button
                  onClick={() => {
                    // Add settings page navigation if needed
                    setShowDropdown(false);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Settings size={16} />
                  Settings
                </button>
                
                <hr className="my-1" />
                
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}