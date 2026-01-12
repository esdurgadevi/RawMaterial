import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "../../services/authService";

import {
  LayoutDashboard,
  MapPin,
  Building2,
  Truck,
  GitMerge,
  Route,
  Layers,
  ShieldCheck,
  Warehouse,
  Handshake,
  FileText,
  Package,
  TruckIcon,
  Box,
  Trash2,
  IndianRupee,
  Archive,
  BarChart3,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import PurchaseOrderManagement from "../../pages/admin/PurchaseOrderManagement";

const AdminSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const sidebarItems = [
    { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },

    { to: "/admin/state", icon: MapPin, label: "State" },
    { to: "/admin/station", icon: Building2, label: "Station" },
    { to: "/admin/supplier", icon: Truck, label: "Supplier" },
    { to: "/admin/broker", icon: Handshake, label: "Broker" },
    
    { to: "/admin/mixing_group", icon: GitMerge, label: "Mixing Group" },
    { to: "/admin/mixing_group_routes", icon: Route, label: "Mixing Group Routes" },

    { to: "/admin/variety", icon: ShieldCheck, label: "Variety" },
    { to: "/admin/godown", icon: Warehouse, label: "Godown" },
    { to: "/admin/company-broker", icon: Handshake, label: "Company Broker" },
    { to: "/admin/wc-sales", icon: FileText, label: "WC Sales Invoice" },
    { to: "/admin/commodity", icon: Package, label: "Commodity" },
    { to: "/admin/fibre", icon: Layers, label: "Fibre" },

    //waste rate master

    { to: "/admin/transport", icon: TruckIcon, label: "Transport" },
    //waste name
    { to: "/admin/packing-type", icon: Box, label: "Packing Type" },

    { to: "/admin/waste", icon: Trash2, label: "Waste" },
    { to: "/admin/waste-rates", icon: IndianRupee, label: "Waste Rate" },
    { to: "/admin/waste-lot", icon:Package , label:"Waste Lot"},
    { to:"/admin/cost-master",icon:IndianRupee,label:"Cost Master"},
    { to: "/admin/reports", icon: BarChart3, label: "Reports" },
    { to:"/admin/purchase-order", icon:Package,label:"Purchase Order"},
    { to:"/admin/inward-entries",icon:Package,label:"Inward Entries"},
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
    setIsOpen(false);
  };

  return (
    <>
      {/* Hide scrollbar */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
      `}</style>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#11101d] text-white
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        flex flex-col shadow-2xl`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-[#1d1b31]">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-indigo-500" />
            <span className="text-xl font-bold tracking-wide">Admin Panel</span>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto no-scrollbar py-4 px-3">
          <ul className="space-y-1.5">
            {sidebarItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <li key={index}>
                  <NavLink
                    to={item.to}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all
                      ${
                        isActive
                          ? "bg-white text-[#11101d] shadow-md scale-[1.02]"
                          : "text-gray-400 hover:bg-white/10 hover:text-white"
                      }`
                    }
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              );
            })}

            {/* Logout */}
            <li className="pt-4 mt-2 border-t border-[#1d1b31]">
              <button
                onClick={handleLogout}
                className="flex items-center gap-4 px-4 py-3 w-full rounded-xl text-sm
                text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Mobile menu button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-50 lg:hidden p-2.5 rounded-lg
          bg-[#11101d] text-white shadow-lg"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}
    </>
  );
};

export default AdminSidebar;
