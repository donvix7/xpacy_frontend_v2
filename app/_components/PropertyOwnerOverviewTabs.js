"use client";

import { useState } from "react";
import { FaHome, FaCalendarCheck, FaRegHeart } from "react-icons/fa";

export default function PropertyOwnerOverviewTabs({ overviewItems, recentActivity }) {
    const [activeTab, setActiveTab] = useState("overview");

    return (
        <div className="flex flex-col gap-6">
            {/* Tabs Header */}
            <div className="flex items-center gap-6 border-b border-gray-100">
                <button 
                    onClick={() => setActiveTab("overview")}
                    className={`pb-3 text-sm font-semibold transition-colors relative ${
                        activeTab === "overview" ? "text-primary border-b-2 border-primary" : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                    Overview
                </button>
                <button 
                    onClick={() => setActiveTab("activity")}
                    className={`pb-3 text-sm font-semibold transition-colors relative ${
                        activeTab === "activity" ? "text-primary border-b-2 border-primary" : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                    Recent Activity
                </button>
            </div>

            {/* Tab Content */}
            <div className="min-h-[200px]">
                {activeTab === "overview" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {overviewItems.map((item, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow duration-300">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex flex-col">
                                        <span className="text-gray-500 text-sm font-medium">{item.title}</span>
                                        <span className="text-2xl font-bold text-gray-900 mt-1">{item.count}</span>
                                    </div>
                                    <div className={`p-3 rounded-full ${item.color} bg-opacity-20`}>
                                        {item.icon}
                                    </div>
                                </div>
                                <div className="text-xs text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded-md self-start">
                                    {item.change}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        {recentActivity.length > 0 ? (
                            recentActivity.map((activity, i) => (
                                <div key={i} className="flex items-center justify-between p-4 border-b border-gray-50 last:border-none hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2.5 rounded-full bg-gray-100 text-gray-500 shrink-0">
                                             {activity.type === 'Booking' ? <FaCalendarCheck size={16} /> : <FaHome size={16} />}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm text-gray-800">{activity.type === 'Booking' ? 'New Booking' : 'Service Request'}</p>
                                            <p className="text-xs text-gray-500 line-clamp-1 max-w-[200px]">{activity.property_name || activity.property?.property_name || "Unknown Property"}</p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-xs font-medium text-gray-900">
                                            {new Date(activity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </p>
                                        <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-full capitalize ${
                                            (activity.status || activity.service_status) === 'pending' ? 'bg-orange-50 text-orange-600' :
                                            (activity.status || activity.service_status) === 'confirmed' ? 'bg-green-50 text-green-600' : 
                                            'bg-gray-100 text-gray-500'
                                        }`}>
                                            {activity.status || activity.service_status || 'Pending'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-500 text-sm">No recent activity found.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
