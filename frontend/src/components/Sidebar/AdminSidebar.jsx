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
  BarChart3,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";

const AdminSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openSection, setOpenSection] = useState("");
  const navigate = useNavigate();

  /* ---------------- MENU GROUPS ---------------- */

  const dashboardItem = [
    { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  ];

  const masterItems = [
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
    { to: "/admin/transport", icon: TruckIcon, label: "Transport" },
    { to: "/admin/packing-type", icon: Box, label: "Packing Type" },
    { to: "/admin/waste", icon: Trash2, label: "Waste" },
    { to: "/admin/waste-rates", icon: IndianRupee, label: "Waste Rate" },
    { to: "/admin/waste-lot", icon: Package, label: "Waste Lot" },
    { to: "/admin/cost-master", icon: IndianRupee, label: "Cost Master" },
    { to: "/admin/reports", icon: BarChart3, label: "Reports" },
  ];

  const cottonTransactionItems = [
    { to: "/admin/purchase-order", icon: Package, label: "Purchase Order" },
    { to: "/admin/inward-entries", icon: Package, label: "Inward Entries" },
    { to: "/admin/inward-lot", icon: Package, label: "Inward Lot" },
    { to: "/admin/issue", icon: Package, label: "Issue" },
  ];

  const wasteTransactionItems = [
    { to: "/admin/waste1", icon: Package, label: "Waste1" },
    { to: "/admin/sales-order", icon: Package, label: "Waste Sales Order" },
    { to: "/admin/waste-order", icon: Package, label: "Waste Cotton Invoice" },
    { to: "/admin/waste-entry", icon: Package, label: "Waste Entry" },
  ];

  /* ---------------- LOGOUT ---------------- */

  const handleLogout = async () => {
    await logout();
    navigate("/login");
    setIsOpen(false);
  };

  /* ---------------- UI ---------------- */

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#11101d] text-white
        transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-[#1d1b31]">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-indigo-500" />
            <span className="text-xl font-bold">KR Exports RawMaterial</span>
          </div>
          <button className="lg:hidden" onClick={() => setIsOpen(false)}>
            <X />
          </button>
        </div>

        {/* Menu */}
        <nav className="p-3 overflow-y-auto h-full">
          <ul className="space-y-1.5">

            {/* Dashboard */}
            {dashboardItem.map((item, i) => (
              <SidebarLink key={i} item={item} setIsOpen={setIsOpen} />
            ))}

            {/* Master */}
            <SidebarSection
              title="Master"
              open={openSection === "master"}
              onClick={() => setOpenSection(openSection === "master" ? "" : "master")}
              items={masterItems}
              setIsOpen={setIsOpen}
            />

            {/* Transaction Cotton */}
            <SidebarSection
              title="Transaction - Cotton"
              open={openSection === "cotton"}
              onClick={() => setOpenSection(openSection === "cotton" ? "" : "cotton")}
              items={cottonTransactionItems}
              setIsOpen={setIsOpen}
            />

            {/* Transaction Waste */}
            <SidebarSection
              title="Transaction - Waste"
              open={openSection === "waste"}
              onClick={() => setOpenSection(openSection === "waste" ? "" : "waste")}
              items={wasteTransactionItems}
              setIsOpen={setIsOpen}
            />

            {/* Logout */}
            <li className="pt-4 mt-3 border-t border-[#1d1b31]">
              <button
                onClick={handleLogout}
                className="flex items-center gap-4 px-4 py-3 w-full
                text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </li>

          </ul>
        </nav>
      </aside>

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-50 lg:hidden bg-[#11101d] p-2 rounded-lg"
        >
          <Menu />
        </button>
      )}
    </>
  );
};

/* ---------------- REUSABLE COMPONENTS ---------------- */

const SidebarSection = ({ title, open, onClick, items, setIsOpen }) => (
  <li>
    <button
      onClick={onClick}
      className="flex justify-between items-center w-full px-4 py-3
      text-gray-300 hover:bg-white/10 rounded-xl"
    >
      <span>{title}</span>
      <ChevronDown className={`transition ${open ? "rotate-180" : ""}`} />
    </button>

    {open && (
      <ul className="ml-4 mt-1 space-y-1">
        {items.map((item, i) => (
          <SidebarLink key={i} item={item} setIsOpen={setIsOpen} />
        ))}
      </ul>
    )}
  </li>
);

const SidebarLink = ({ item, setIsOpen }) => {
  const Icon = item.icon;
  return (
    <li>
      <NavLink
        to={item.to}
        onClick={() => setIsOpen(false)}
        className={({ isActive }) =>
          `flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium
          ${
            isActive
              ? "bg-white text-[#11101d]"
              : "text-gray-400 hover:bg-white/10 hover:text-white"
          }`
        }
      >
        <Icon className="w-5 h-5" />
        {item.label}
      </NavLink>
    </li>
  );
};

export default AdminSidebar;
