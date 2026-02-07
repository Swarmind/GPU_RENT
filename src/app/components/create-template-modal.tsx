import { X, Plus, ChevronDown, Lock, LockOpen, HelpCircle } from "lucide-react";
import { useState } from "react";

interface CreateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateTemplateModal({ isOpen, onClose }: CreateTemplateModalProps) {
  const [activeTab, setActiveTab] = useState<"config" | "readme">("config");
  const [templateName, setTemplateName] = useState("");
  const [description, setDescription] = useState("");
  const [imagePath, setImagePath] = useState("");
  const [dockerOptions, setDockerOptions] = useState("");
  const [portType, setPortType] = useState<"TCP" | "UDP">("TCP");
  const [port, setPort] = useState("");
  const [envVars, setEnvVars] = useState<Array<{ key: string; value: string }>>([
    { key: "", value: "" }
  ]);
  const [showPorts, setShowPorts] = useState(true);
  const [showEnvVars, setShowEnvVars] = useState(true);
  const [onStartScript, setOnStartScript] = useState("");
  const [extraFilters, setExtraFilters] = useState("");
  const [dockerServer, setDockerServer] = useState("");
  const [dockerUsername, setDockerUsername] = useState("");
  const [dockerToken, setDockerToken] = useState("");
  const [diskSize, setDiskSize] = useState("8");
  const [diskUnit, setDiskUnit] = useState("GB");
  const [addVolumeSettings, setAddVolumeSettings] = useState(false);
  const [isPrivate, setIsPrivate] = useState(true);
  const [vramRequired, setVramRequired] = useState("");
  const [maxPricePerHour, setMaxPricePerHour] = useState("");

  if (!isOpen) return null;

  const handleAddEnvVar = () => {
    setEnvVars([...envVars, { key: "", value: "" }]);
  };

  const handleEnvVarChange = (index: number, field: "key" | "value", value: string) => {
    const newEnvVars = [...envVars];
    newEnvVars[index][field] = value;
    setEnvVars(newEnvVars);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl text-slate-900">Create New Template</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 px-6 pt-4 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("config")}
            className={`pb-3 px-1 border-b-2 transition ${
              activeTab === "config"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            Config
          </button>
          <button
            onClick={() => setActiveTab("readme")}
            className={`pb-3 px-1 border-b-2 transition ${
              activeTab === "readme"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            ReadMe
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "config" ? (
            <div className="space-y-8">
              {/* Identification */}
              <div>
                <h3 className="text-lg mb-4 text-slate-900">Identification</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-700 mb-2">
                      Template Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Your Template Name"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-700 mb-2">
                      Template Description
                    </label>
                    <input
                      type="text"
                      placeholder="Short Description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* On-start Script */}
              <div>
                <h3 className="text-lg mb-2 text-slate-900">On-start Script</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Bash commands that are invoked whenever your instance starts, see FAQ/Docs for details.
                </p>
                <textarea
                  value={onStartScript}
                  onChange={(e) => setOnStartScript(e.target.value)}
                  className="w-full h-32 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="#!/bin/bash&#10;# Your startup commands here"
                />
              </div>

              {/* Extra Filters */}
              <div>
                <p className="text-sm text-slate-600 mb-4">
                  Extra Filters (CLI Format: verified=true gpu_display_active=true...)
                </p>
                <textarea
                  value={extraFilters}
                  onChange={(e) => setExtraFilters(e.target.value)}
                  className="w-full h-32 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="verified=true gpu_display_active=true"
                />
              </div>

              {/* VRAM and Price Requirements */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-700 mb-2">
                    VRAM Required (GB)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 8, 16, 24"
                    value={vramRequired}
                    onChange={(e) => setVramRequired(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-700 mb-2">
                    Max Price per Hour ($)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 0.50, 1.00"
                    value={maxPricePerHour}
                    onChange={(e) => setMaxPricePerHour(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Docker Repository Authentication */}
              <div>
                <h3 className="text-lg mb-4 text-slate-900">
                  Docker Repository Authentication
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-slate-700 mb-2">
                      Server
                    </label>
                    <input
                      type="text"
                      placeholder="Server name (i.e: docker.io)"
                      value={dockerServer}
                      onChange={(e) => setDockerServer(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-700 mb-2">
                      Docker Username
                    </label>
                    <input
                      type="text"
                      placeholder="Docker Login Username"
                      value={dockerUsername}
                      onChange={(e) => setDockerUsername(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-700 mb-2">
                      Docker Access Token
                    </label>
                    <input
                      type="password"
                      placeholder="Docker Login Access Token"
                      value={dockerToken}
                      onChange={(e) => setDockerToken(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Disk Space */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-lg text-slate-900">
                    Disk Space (Container + Volume)
                  </h3>
                  <HelpCircle className="w-4 h-4 text-slate-400" />
                </div>
                <div className="mb-4">
                  <label className="block text-sm text-slate-700 mb-2">
                    Container disk size (8 GB - 1024 TB)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={diskSize}
                      onChange={(e) => setDiskSize(e.target.value)}
                      className="w-32 px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="8"
                      max="1024"
                    />
                    <div className="relative">
                      <select
                        value={diskUnit}
                        onChange={(e) => setDiskUnit(e.target.value)}
                        className="appearance-none px-4 py-2.5 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
                      >
                        <option value="GB">GB</option>
                        <option value="TB">TB</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addVolumeSettings}
                    onChange={(e) => setAddVolumeSettings(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">
                    Add recommended volume settings
                  </span>
                </label>
              </div>

              {/* Public/Private Toggle */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsPrivate(false)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition ${
                    !isPrivate
                      ? "border-slate-300 bg-white"
                      : "border-transparent bg-slate-100"
                  }`}
                >
                  <LockOpen className="w-5 h-5" />
                  <span>Public</span>
                </button>
                <button
                  onClick={() => setIsPrivate(true)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition ${
                    isPrivate
                      ? "border-blue-500 bg-blue-50 text-blue-600"
                      : "border-transparent bg-slate-100"
                  }`}
                >
                  <Lock className="w-5 h-5" />
                  <span>Private</span>
                </button>
              </div>

              {/* Docker Repository */}
              <div>
                <h3 className="text-lg mb-4 text-slate-900">
                  Docker Repository And Environment
                </h3>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-700 mb-2">
                        Image Path:Tag
                      </label>
                      <input
                        type="text"
                        placeholder="ex: pytorch/pytorch:latest, ubuntu/ubuntu"
                        value={imagePath}
                        onChange={(e) => setImagePath(e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-slate-500 mt-1.5">
                        Grab these from Docker Hub, GHCR, etc.
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-700 mb-2">
                        Version Tag
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Enter image path first"
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-400"
                          disabled
                        />
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-700 mb-2">
                      Docker Options
                    </label>
                    <input
                      type="text"
                      placeholder="Docker create/run options ex: -e TZ=UTC -p 8081:8081 -h hostname"
                      value={dockerOptions}
                      onChange={(e) => setDockerOptions(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Ports */}
                  <div className="border border-slate-200 rounded-lg p-4">
                    <button
                      onClick={() => setShowPorts(!showPorts)}
                      className="flex items-center justify-between w-full mb-3"
                    >
                      <span className="text-sm text-slate-700">Ports</span>
                      <ChevronDown
                        className={`w-4 h-4 transition ${
                          showPorts ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {showPorts && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Port"
                          value={port}
                          onChange={(e) => setPort(e.target.value)}
                          className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex border border-slate-300 rounded-lg overflow-hidden">
                          <button
                            onClick={() => setPortType("TCP")}
                            className={`px-4 py-2.5 transition ${
                              portType === "TCP"
                                ? "bg-blue-600 text-white"
                                : "bg-white text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            TCP
                          </button>
                          <button
                            onClick={() => setPortType("UDP")}
                            className={`px-4 py-2.5 transition ${
                              portType === "UDP"
                                ? "bg-blue-600 text-white"
                                : "bg-white text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            UDP
                          </button>
                        </div>
                        <button className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition">
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Environment Variables */}
                  <div className="border border-slate-200 rounded-lg p-4">
                    <button
                      onClick={() => setShowEnvVars(!showEnvVars)}
                      className="flex items-center justify-between w-full mb-3"
                    >
                      <span className="text-sm text-slate-700">
                        Environment Variables
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 transition ${
                          showEnvVars ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {showEnvVars && (
                      <div className="space-y-2">
                        {envVars.map((envVar, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Key"
                              value={envVar.key}
                              onChange={(e) =>
                                handleEnvVarChange(index, "key", e.target.value)
                              }
                              className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                              type="text"
                              placeholder="Value"
                              value={envVar.value}
                              onChange={(e) =>
                                handleEnvVarChange(index, "value", e.target.value)
                              }
                              className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        ))}
                        <button
                          onClick={handleAddEnvVar}
                          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          <Plus className="w-4 h-4" />
                          Add Variable
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <textarea
                placeholder="Add your README content here..."
                className="w-full h-96 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Create
          </button>
          <button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Create & Use
          </button>
        </div>
      </div>
    </div>
  );
}