import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Home, 
  FileText, 
  List, 
  Settings, 
  Bot,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Posts", href: "/posts", icon: FileText },
  { name: "Queue", href: "/queue", icon: List },
  { name: "Automation", href: "/automation", icon: Bot },
  { name: "Configuration", href: "/configuration", icon: Settings },
];

export default function Sidebar({ collapsed, onCollapse, open, onOpenChange }: SidebarProps) {
  const [location] = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => onOpenChange(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      } ${collapsed ? 'lg:w-16' : 'lg:w-64'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            {!collapsed && (
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Reddit Bot
              </h2>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => collapsed ? onCollapse(false) : onOpenChange(false)}
              className="lg:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;
              
              return (
                <Link key={item.name} href={item.href}>
                  <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}>
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && (
                      <span className="ml-3">{item.name}</span>
                    )}
                  </a>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700 hidden lg:block">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCollapse(!collapsed)}
              className="w-full justify-start"
            >
              <Menu className="h-5 w-5" />
              {!collapsed && <span className="ml-3">Collapse</span>}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}