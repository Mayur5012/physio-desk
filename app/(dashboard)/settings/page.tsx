"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import Toast, { useToast } from "@/components/ui/Toast";
import {
  Save, Trash2, Plus, Settings, Clock, Shield, Mail, Award,
  Building2, User, Phone, MapPin, Bell, CalendarClock, Briefcase
} from "lucide-react";
import { PRACTICE_TYPES, getPracticeConfig } from "@/lib/constants";

export default function SettingsPage() {
  const router = useRouter();
  const { toast, showToast, hideToast } = useToast();

  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  // ── Load doctor profile ───────────────────────────────────
  useEffect(() => {
    api
      .get("/auth/profile")
      .then(({ data }) => setDoctor(data))
      .catch(() => showToast("Failed to load settings", "error"))
      .finally(() => setLoading(false));
  }, []);

  // ── Handle profile update ─────────────────────────────────
  const handleProfileUpdate = async () => {
    try {
      setSaving(true);
      await api.put("/auth/profile", doctor);
      showToast("Settings saved successfully", "success");
    } catch (error: any) {
      showToast(error.response?.data?.error || "Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Handle add specialization ────────────────────────────
  const handleAddSpecialization = (type: string) => {
    if (!doctor.specializations?.includes(type)) {
      setDoctor({
        ...doctor,
        specializations: [...(doctor.specializations || []), type],
      });
    }
  };

  // ── Handle remove specialization ─────────────────────────
  const handleRemoveSpecialization = (type: string) => {
    setDoctor({
      ...doctor,
      specializations: doctor.specializations.filter((s: string) => s !== type),
    });
  };

  // ── Handle add license ───────────────────────────────────
  const handleAddLicense = () => {
    setDoctor({
      ...doctor,
      licenses: [
        ...(doctor.licenses || []),
        {
          name: "",
          issuingBody: "",
          licenseNumber: "",
          practiceTypes: [],
        },
      ],
    });
  };

  // ── Handle remove license ────────────────────────────────
  const handleRemoveLicense = (index: number) => {
    setDoctor({
      ...doctor,
      licenses: doctor.licenses.filter((_: any, i: number) => i !== index),
    });
  };

  // ── Handle license update ────────────────────────────────
  const handleLicenseUpdate = (index: number, field: string, value: any) => {
    const updatedLicenses = [...(doctor.licenses || [])];
    updatedLicenses[index] = { ...updatedLicenses[index], [field]: value };
    setDoctor({ ...doctor, licenses: updatedLicenses });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Spinner size="lg" color="blue" />
        <p className="text-gray-500 font-medium italic">Loading settings...</p>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-2xl mx-auto">
        <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
           <Shield size={32} className="text-red-400" />
        </div>
        <h3 className="text-xl font-black text-gray-900">Authentication Link Broken</h3>
        <p className="text-gray-500 mt-2">We couldn't retrieve your profile data. Please try re-logging in.</p>
        <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 bg-gray-900 text-white rounded-xl font-bold">Refresh Page</button>
      </div>
    );
  }

  const tabs = [
    { key: "profile", label: "Profile", icon: <Building2 size={18} /> },
    { key: "specializations", label: "Services", icon: <Award size={18} /> },
    { key: "licenses", label: "Licenses", icon: <Shield size={18} /> },
    { key: "schedule", label: "Schedule", icon: <Clock size={18} /> },
    { key: "comm", label: "Email Settings", icon: <Mail size={18} /> },
    { key: "reminders", label: "Reminders", icon: <Bell size={18} /> },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="relative">
        <div className="absolute top-0 right-0 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center gap-3">
           <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-black overflow-hidden">
              {doctor.logoUrl ? (
                <img src={doctor.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                doctor.name?.[0].toUpperCase()
              )}
           </div>
           <div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-tighter">Verified Provider</p>
              <p className="text-sm font-black text-gray-900">{doctor.name}</p>
           </div>
        </div>
        <div className="space-y-1">
          <h2 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3 italic">
            Settings<span className="text-blue-600">.</span>
          </h2>
          <p className="text-gray-500 max-w-lg">
            Manage your clinic's profile, schedule, and automation settings.
          </p>
        </div>
      </div>

      {/* Modern Tabs */}
      <div className="flex items-center gap-2 bg-gray-100/50 p-1.5 rounded-2xl w-fit border border-gray-200/50 backdrop-blur-sm overflow-x-auto max-w-full">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap ${
              activeTab === tab.key
                ? "bg-white text-blue-600 shadow-md translate-y-[-1px]"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* ── CLINIC PROFILE ── */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <Card className="p-8 border-none shadow-2xl shadow-slate-200 rounded-[2.5rem] bg-white">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Clinic Profile</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Basic clinic information</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <Input
                    label="Clinic Name"
                    icon={<Building2 size={16} className="text-gray-400" />}
                    value={doctor.clinicName}
                    onChange={(e) => setDoctor({ ...doctor, clinicName: e.target.value })}
                    className="rounded-2xl border-gray-100 focus:border-blue-500 transition-all font-medium"
                  />
                  <Input
                    label="Doctor Name"
                    icon={<Briefcase size={16} className="text-gray-400" />}
                    value={doctor.name}
                    onChange={(e) => setDoctor({ ...doctor, name: e.target.value })}
                    className="rounded-2xl border-gray-100 font-medium"
                  />
                  <Input
                    label="Clinic Logo (URL)"
                    icon={<Plus size={16} className="text-gray-400" />}
                    value={doctor.logoUrl || ""}
                    onChange={(e) => setDoctor({ ...doctor, logoUrl: e.target.value })}
                    placeholder="https://example.com/logo.png"
                    className="rounded-2xl border-gray-100 font-medium"
                  />
                </div>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Clinic Email"
                      icon={<Mail size={16} className="text-gray-400" />}
                      type="email"
                      value={doctor.email}
                      onChange={(e) => setDoctor({ ...doctor, email: e.target.value })}
                      className="rounded-2xl border-gray-100 font-medium"
                    />
                    <Input
                      label="Clinic Phone"
                      icon={<Phone size={16} className="text-gray-400" />}
                      value={doctor.phone}
                      onChange={(e) => setDoctor({ ...doctor, phone: e.target.value })}
                      className="rounded-2xl border-gray-100 font-medium"
                    />
                  </div>
                  <Input
                    label="Practice Headquarters"
                    icon={<MapPin size={16} className="text-gray-400" />}
                    value={doctor.address || ""}
                    onChange={(e) => setDoctor({ ...doctor, address: e.target.value })}
                    className="rounded-2xl border-gray-100 font-medium"
                  />
                   <Input
                    label="Default Session (Minutes)"
                    icon={<Clock size={16} className="text-gray-400" />}
                    type="number"
                    value={doctor.defaultSlotMins}
                    onChange={(e) => setDoctor({ ...doctor, defaultSlotMins: parseInt(e.target.value) })}
                    className="rounded-2xl border-gray-100 font-medium"
                  />
                </div>
              </div>

              <div className="mt-12 flex justify-end">
                <Button
                  onClick={handleProfileUpdate}
                  disabled={saving}
                  className="px-10 py-4 bg-gray-900 text-white rounded-[1.25rem] font-bold hover:shadow-xl transition-all"
                  icon={<Save size={20} />}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* ── COMMUNICATION ── */}
        {activeTab === "comm" && (
          <div className="space-y-6">
            <Card className="p-8 border-none shadow-2xl shadow-slate-200 rounded-[2.5rem] bg-white ring-1 ring-gray-100">
               <div className="flex items-center gap-3 mb-10 pb-4 border-b border-gray-50">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Email Settings</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Connect with patient via Email</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                     <div>
                        <h5 className="text-sm font-black text-gray-900 mb-6 flex items-center gap-2 italic">
                           <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                           SMTP Configuration
                        </h5>
                        <div className="space-y-4">
                           <Input
                              label="Sending Email"
                              value={doctor.smtpEmail || ""}
                              onChange={(e) => setDoctor({ ...doctor, smtpEmail: e.target.value })}
                              placeholder="noreply@yourclinic.com"
                              className="rounded-xl border-gray-100 font-semibold"
                           />
                           <Input
                              label="SMTP Access Token / Password"
                              type="password"
                              value={doctor.smtpPassword || ""}
                              onChange={(e) => setDoctor({ ...doctor, smtpPassword: e.target.value })}
                              className="rounded-xl border-gray-100 font-semibold"
                           />
                        </div>
                     </div>
                  </div>

                  <div className="space-y-8">
                     <div>
                        <h5 className="text-sm font-black text-gray-900 mb-6 flex items-center gap-2 italic">
                           <div className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                           Resend Integration
                        </h5>
                        <div className="space-y-4">
                           <Input
                              label="Resend API Key"
                              value={doctor.resendApiKey || ""}
                              onChange={(e) => setDoctor({ ...doctor, resendApiKey: e.target.value })}
                              placeholder="re_XyZ123..."
                              className="rounded-xl border-gray-100 font-mono text-xs"
                           />
                           <p className="text-[10px] text-gray-400 font-medium px-1">
                              Used for patient notifications and automated appointment reminders.
                           </p>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="mt-12 pt-8 border-t border-gray-50 flex justify-end">
                  <Button
                    onClick={handleProfileUpdate}
                    disabled={saving}
                    className="px-10 py-4 bg-gray-900 text-white rounded-[1.25rem] font-bold"
                    icon={<Save size={20} />}
                  >
                    Save Email Settings
                  </Button>
               </div>
            </Card>
          </div>
        )}

        {/* ── SPECIALIZATIONS ── */}
        {activeTab === "specializations" && (
          <div className="space-y-6">
            <Card className="p-8 border-none shadow-2xl shadow-slate-200 rounded-[2.5rem] bg-white ring-1 ring-gray-100">
               <div className="flex items-center justify-between mb-10">
                 <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                      <Award size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-gray-900 tracking-tight">Services</h3>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Clinic specializations</p>
                    </div>
                 </div>
                 <Button
                    onClick={handleProfileUpdate}
                    disabled={saving}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-none px-6 py-2.5 rounded-xl font-black text-xs uppercase"
                  >
                    Sync Changes
                  </Button>
               </div>

              <div className="p-6 bg-slate-50/50 rounded-3xl border border-dashed border-gray-200 mb-10">
                 <h4 className="text-sm font-black text-gray-600 mb-4 italic tracking-tight">Currently Active:</h4>
                 {doctor.specializations && doctor.specializations.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {doctor.specializations.map((spec: string) => (
                      <Badge
                        key={spec}
                        label={spec}
                        variant="blue"
                        onClose={() => handleRemoveSpecialization(spec)}
                        className="px-4 py-2 rounded-xl bg-white border border-gray-100 shadow-sm text-blue-600 font-bold"
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 font-medium italic">Define your clinic services below to show them on your profile.</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {Object.entries(PRACTICE_TYPES).map(([key, value]) => (
                  <button
                    key={value}
                    onClick={() => handleAddSpecialization(value)}
                    disabled={doctor.specializations?.includes(value)}
                    className={`group p-5 rounded-2xl border transition-all text-left relative overflow-hidden ${
                      doctor.specializations?.includes(value)
                        ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100"
                        : "bg-white border-gray-100 text-gray-900 hover:border-blue-400 hover:shadow-xl hover:translate-y-[-2px]"
                    }`}
                  >
                    <div className="relative z-10">
                      <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${doctor.specializations?.includes(value) ? 'text-blue-100' : 'text-gray-400'}`}>Practice Type</p>
                     <p className="text-sm font-black italic">{getPracticeConfig(value)?.label || value}</p>
                    </div>
                    {doctor.specializations?.includes(value) && (
                      <Shield size={60} className="absolute -right-4 -bottom-4 text-white/10 rotate-12" />
                    )}
                  </button>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* ── LICENSES ── */}
        {activeTab === "licenses" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
               <div>
                  <h3 className="text-xl font-black text-gray-900 italic">Licenses</h3>
                  <p className="text-gray-500 text-sm">Add and manage your medical licenses.</p>
               </div>
               <button
                  onClick={handleAddLicense}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:shadow-xl transition-all shadow-lg shadow-blue-100"
                >
                  <Plus size={16} /> New Credential
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {doctor.licenses && doctor.licenses.map((license: any, idx: number) => (
                <Card key={idx} className="p-8 border-none shadow-xl rounded-[2.5rem] bg-white group relative overflow-hidden ring-1 ring-gray-100">
                  <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button
                        onClick={() => handleRemoveLicense(idx)}
                        className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100"
                      >
                        <Trash2 size={18} />
                      </button>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white font-black italic">
                      #{idx + 1}
                    </div>
                    <div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Credential Block</p>
                        <h4 className="font-black text-gray-900 italic tracking-tight">{license.name || "Untitled License"}</h4>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <Input
                      label="Designation (e.g., PT, MD)"
                      value={license.name}
                      onChange={(e) => handleLicenseUpdate(idx, "name", e.target.value)}
                      className="rounded-xl border-gray-100 font-semibold"
                    />
                    <Input
                      label="Authority Body"
                      value={license.issuingBody || ""}
                      onChange={(e) => handleLicenseUpdate(idx, "issuingBody", e.target.value)}
                      className="rounded-xl border-gray-100 font-semibold"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="license_hex_id"
                        value={license.licenseNumber || ""}
                        onChange={(e) => handleLicenseUpdate(idx, "licenseNumber", e.target.value)}
                        className="rounded-xl border-gray-100 font-mono text-xs"
                      />
                      <Input
                        label="Expiration"
                        type="date"
                        value={license.expiryDate ? new Date(license.expiryDate).toISOString().split("T")[0] : ""}
                        onChange={(e) => handleLicenseUpdate(idx, "expiryDate", e.target.value)}
                        className="rounded-xl border-gray-100 text-xs"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="pt-8 border-t border-gray-100 flex justify-end">
               <Button
                  onClick={handleProfileUpdate}
                  disabled={saving}
                  className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-bold"
                  icon={<Save size={20} />}
                >
                  Save Licenses
                </Button>
            </div>
          </div>
        )}

        {/* ── SCHEDULE ── */}
        {activeTab === "schedule" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <div className="md:col-span-2">
                <Card className="p-8 border-none shadow-2xl rounded-[2.5rem] bg-white ring-1 ring-gray-100">
                    <div className="flex items-center gap-3 mb-10 pb-4 border-b border-gray-50">
                      <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl">
                        <CalendarClock size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-gray-900 tracking-tight italic">Working Hours</h3>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Manage your clinic's weekly schedule</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-10">
                       <div className="space-y-8">
                          <div>
                            <h5 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">Core Window</h5>
                            <div className="space-y-4">
                               <Input
                                  label="Start Time"
                                  type="time"
                                  value={doctor.workStartTime}
                                  onChange={(e) => setDoctor({ ...doctor, workStartTime: e.target.value })}
                                  className="rounded-xl border-gray-100 font-bold"
                                />
                                <Input
                                  label="End Time"
                                  type="time"
                                  value={doctor.workEndTime}
                                  onChange={(e) => setDoctor({ ...doctor, workEndTime: e.target.value })}
                                  className="rounded-xl border-gray-100 font-bold"
                                />
                            </div>
                          </div>
                       </div>
                       <div className="space-y-8">
                          <div>
                            <h5 className="text-sm font-black text-gray-400 mb-4 flex items-center gap-2">Break Time</h5>
                            <div className="space-y-4">
                               <Input
                                  label="Break Start"
                                  type="time"
                                  value={doctor.breakStartTime || ""}
                                  onChange={(e) => setDoctor({ ...doctor, breakStartTime: e.target.value })}
                                  className="rounded-xl border-gray-100 font-semibold"
                                />
                                <Input
                                  label="Break End"
                                  type="time"
                                  value={doctor.breakEndTime || ""}
                                  onChange={(e) => setDoctor({ ...doctor, breakEndTime: e.target.value })}
                                  className="rounded-xl border-gray-100 font-semibold"
                                />
                            </div>
                          </div>
                       </div>
                    </div>

                    <div className="mt-12 flex justify-end">
                      <Button onClick={handleProfileUpdate} disabled={saving} className="bg-gray-900 text-white rounded-xl px-8 font-black py-3">
                         Save Schedule
                      </Button>
                    </div>
                </Card>
             </div>
             <div>
                <Card className="p-8 border-none shadow-xl rounded-[2.5rem] bg-gradient-to-br from-teal-500 to-emerald-600 text-white h-full">
                   <h4 className="text-lg font-black mb-6 italic tracking-tight underline decoration-teal-300">Why set a schedule?</h4>
                   <p className="text-teal-50 leading-relaxed text-sm mb-6">
                      Your schedule determines the appointment slots available for your patients. Make sure to include time for emergencies and administrative work.
                   </p>
                   <div className="p-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-md">
                      <p className="text-[10px] font-black uppercase tracking-widest text-teal-100 mb-2">Active Hours</p>
                      <p className="text-2xl font-black italic">{doctor.workStartTime} — {doctor.workEndTime}</p>
                   </div>
                </Card>
             </div>
          </div>
        )}

        {/* ── REMINDERS / AUTOMATION ── */}
        {activeTab === "reminders" && (
          <Card className="p-8 border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden relative">
             <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -mr-32 -mt-32" />
             
             <div className="relative z-10 space-y-10">
                <div className="flex items-center gap-3 mb-10 pb-4 border-b border-gray-50">
                  <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100">
                    <Bell size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 tracking-tight italic">Reminders & Alerts</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Automatic notifications and alerts</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <div className="space-y-8">
                      <div className="flex items-start gap-4 group cursor-pointer" onClick={() => setDoctor({...doctor, reminderEnabled: !doctor.reminderEnabled})}>
                         <div className={`p-4 rounded-2xl transition-all duration-500 ${doctor.reminderEnabled ? 'bg-blue-600 text-white translate-x-1' : 'bg-gray-100 text-gray-400'}`}>
                            <CalendarClock size={24} />
                         </div>
                         <div>
                            <p className="font-black text-gray-900 italic tracking-tight">Appointment Reminders</p>
                            <p className="text-sm text-gray-500 mb-4">Send automatic reminders to patients before their session.</p>
                            <div className="flex items-center gap-4">
                               <div className={`w-12 h-6 rounded-full relative transition-colors duration-500 ${doctor.reminderEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}>
                                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-500 ${doctor.reminderEnabled ? 'left-7' : 'left-1'}`} />
                               </div>
                               {doctor.reminderEnabled && (
                                  <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100 text-xs font-black text-blue-600">
                                     T-Minus <input type="number" className="bg-transparent w-8 text-center focus:outline-none" value={doctor.reminderHoursBefore} onChange={(e) => setDoctor({...doctor, reminderHoursBefore: parseInt(e.target.value)})}/> Hours
                                  </div>
                               )}
                            </div>
                         </div>
                      </div>

                      <div className="flex items-start gap-4 group cursor-pointer" onClick={() => setDoctor({...doctor, digestEnabled: !doctor.digestEnabled})}>
                         <div className={`p-4 rounded-2xl transition-all duration-500 ${doctor.digestEnabled ? 'bg-gray-900 text-white translate-x-1' : 'bg-gray-100 text-gray-400'}`}>
                            <Mail size={24} />
                         </div>
                         <div>
                            <p className="font-black text-gray-900 italic tracking-tight">Daily Morning Summary</p>
                            <p className="text-sm text-gray-500 mb-4">Get a high-level summary of your day's schedule every morning.</p>
                            <div className="flex items-center gap-4">
                               <div className={`w-12 h-6 rounded-full relative transition-colors duration-500 ${doctor.digestEnabled ? 'bg-gray-900' : 'bg-gray-300'}`}>
                                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-500 ${doctor.digestEnabled ? 'left-7' : 'left-1'}`} />
                               </div>
                               {doctor.digestEnabled && (
                                  <div className="bg-gray-50 px-3 py-1 rounded-lg border border-gray-200 text-xs font-black text-gray-600">
                                     At <input type="time" className="bg-transparent focus:outline-none" value={doctor.digestTime} onChange={(e) => setDoctor({...doctor, digestTime: e.target.value})}/>
                                  </div>
                               )}
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-8">
                      <div className="p-8 bg-blue-50/50 rounded-[2rem] border border-blue-100 flex flex-col justify-between">
                         <div>
                           <h5 className="font-black text-blue-900 italic mb-2 tracking-tight">Inactive Patient Alerts</h5>
                           <p className="text-xs text-blue-700/70 font-medium leading-relaxed mb-6">
                              Identify patients who haven't visited in a while. We'll flag them for you so you can follow up and keep them coming back.
                           </p>
                         </div>
                         <div className="flex items-center justify-between gap-4">
                            <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest">Inactivity Threshold:</span>
                            <div className="bg-white px-4 py-2 rounded-xl text-sm font-black text-blue-600 shadow-sm ring-1 ring-blue-100">
                               <input type="number" className="w-10 text-center bg-transparent focus:outline-none" value={doctor.inactiveAlertDays} onChange={(e) => setDoctor({...doctor, inactiveAlertDays: parseInt(e.target.value)})}/> Days
                            </div>
                         </div>
                      </div>

                      <div className="flex items-center justify-end pt-4">
                        <Button onClick={handleProfileUpdate} disabled={saving} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-100">
                            Save Reminders
                        </Button>
                      </div>
                   </div>
                </div>
             </div>
          </Card>
        )}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </div>
  );
}
