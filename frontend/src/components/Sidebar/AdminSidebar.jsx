import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "../../services/auth/authService";

const AdminSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openSection, setOpenSection] = useState("");
  const navigate = useNavigate();

  /* ---------------- MENU GROUPS ---------------- */

  const dashboardItem = [
    { to: "/admin/dashboard", icon: "📊", label: "Dashboard" },
  ];

  const masterItems = [
    { to: "/admin/state", icon: "📍", label: "State" },
    { to: "/admin/station", icon: "🏢", label: "Station" },
    { to: "/admin/supplier", icon: "🚚", label: "Supplier" },
    { to: "/admin/broker", icon: "🤝", label: "Broker" },
    { to: "/admin/mixing_group", icon: "🔄", label: "Mixing Group" },
    { to: "/admin/mixing_group_routes", icon: "🛣️", label: "Mixing Group Routes" },
    { to: "/admin/variety", icon: "🛡️", label: "Variety" },
    { to: "/admin/godown", icon: "🏭", label: "Godown" },
    { to: "/admin/company-broker", icon: "🤝", label: "Company Broker" },
    { to: "/admin/wc-sales", icon: "📄", label: "WC Sales Invoice" },
    { to: "/admin/commodity", icon: "📦", label: "Commodity" },
    { to: "/admin/fibre", icon: "📊", label: "Fibre" },
    { to: "/admin/transport", icon: "🚛", label: "Transport" },
    { to: "/admin/packing-type", icon: "📦", label: "Packing Type" },
    { to: "/admin/waste", icon: "🗑️", label: "Waste" },
    { to: "/admin/waste-rates", icon: "💰", label: "Waste Rate" },
    { to: "/admin/waste-lot", icon: "📦", label: "Waste Lot" },
    { to: "/admin/cost-master", icon: "💰", label: "Cost Master" },
    { to: "/admin/reports", icon: "📊", label: "Reports" },
  ];

  const cottonTransactionItems = [
    { to: "/admin/purchase-order", icon: "📦", label: "Purchase Order" },
    { to: "/admin/inward-entries", icon: "📦", label: "Inward Entries" },
    { to: "/admin/inward-lot", icon: "📦", label: "Inward Lot" },
    { to: "/admin/issue", icon: "📦", label: "Issue" },
  ];

  const wasteTransactionItems = [
    { to: "/admin/waste1", icon: "📦", label: "Waste1" },
    { to: "/admin/sales-order", icon: "📦", label: "Waste Sales Order" },
    { to: "/admin/waste-order", icon: "📦", label: "Waste Cotton Invoice" },
    { to: "/admin/waste-entry", icon: "📦", label: "Waste Entry" },
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
            <span className="text-2xl text-indigo-500">🛡️</span>
            <span className="text-xl font-bold">KR Exports RawMaterial</span>
          </div>
          <button className="lg:hidden" onClick={() => setIsOpen(false)}>
            <span className="text-xl">✕</span>
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
                <span className="text-lg">🚪</span>
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
          <span className="text-white text-xl">☰</span>
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
      <span className={`text-lg transition ${open ? "rotate-180 inline-block" : ""}`}>▼</span>
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
        <span className="text-lg">{Icon}</span>
        {item.label}
      </NavLink>
    </li>
  );
};

export default AdminSidebar;