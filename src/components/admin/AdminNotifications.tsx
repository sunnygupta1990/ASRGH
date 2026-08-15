import React, { useState } from 'react';
import {
  Bell,
  Send,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Clock,
  Radio,
  Sparkles,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NotificationRecord } from '../../types';

export const AdminNotifications: React.FC = () => {
  const { notifications, sendNotification, announcements, events, socialWorkActivities, members } = useApp();

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [destinationType, setDestinationType] = useState<NotificationRecord['destination_type']>('general');
  const [destinationId, setDestinationId] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      alert('Please enter notification title and message.');
      return;
    }

    setIsSending(true);
    setTimeout(() => {
      sendNotification({
        title: title.trim(),
        message: message.trim(),
        destination_type: destinationType,
        destination_id: destinationId || undefined,
        status: 'sent',
      });

      setIsSending(false);
      setSuccessMessage('Broadcast notification successfully pushed to all registered subscriber devices!');
      setTitle('');
      setMessage('');
      setTimeout(() => setSuccessMessage(''), 5000);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-600" />
            <span>Mobile Push Broadcast & Notification Center</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Deliver instant broadcast alerts, event reminders, and emergency circular updates to community members.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <Smartphone className="w-4 h-4 text-emerald-600" />
          <span>Active Device Reach: <strong>{members.length * 3 + 120} Devices</strong></span>
        </div>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-bold flex items-center gap-2 shadow-2xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Broadcast Composer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
            <Radio className="w-4 h-4 text-amber-600" />
            <span>Compose Broadcast Alert</span>
          </h3>

          <form onSubmit={handleSend} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Notification Title / Headline</label>
              <input
                type="text"
                placeholder="e.g. Sindhi Sangeet Mahotsav: Venue Parking Directions"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Message Body</label>
              <textarea
                rows={4}
                placeholder="Write the notification message to display on phones..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Deep Link</label>
                <select
                  value={destinationType}
                  onChange={(e) => {
                    setDestinationType(e.target.value as any);
                    setDestinationId('');
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium"
                >
                  <option value="general">General Broadcast (Opens App)</option>
                  <option value="announcement">Specific Announcement</option>
                  <option value="event">Upcoming Event Details</option>
                  <option value="social_work">Social Work Program</option>
                </select>
              </div>

              {destinationType === 'announcement' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Select Announcement</label>
                  <select
                    value={destinationId}
                    onChange={(e) => setDestinationId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                  >
                    <option value="">-- Choose Notice --</option>
                    {announcements.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {destinationType === 'event' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Select Event</label>
                  <select
                    value={destinationId}
                    onChange={(e) => setDestinationId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                  >
                    <option value="">-- Choose Event --</option>
                    {events.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {destinationType === 'social_work' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Select Initiative</label>
                  <select
                    value={destinationId}
                    onChange={(e) => setDestinationId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                  >
                    <option value="">-- Choose Program --</option>
                    {socialWorkActivities.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={isSending}
                className="w-full sm:w-auto px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{isSending ? 'Transmitting Broadcast...' : 'Transmit Broadcast Alert'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Live Device Preview Simulation */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-900 rounded-2xl text-white">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
            Device Lockscreen Preview
          </span>
          <div className="w-64 bg-slate-800 border-2 border-slate-700 rounded-3xl p-3 shadow-2xl space-y-3">
            <div className="w-16 h-1 bg-slate-600 rounded-full mx-auto" />
            <div className="text-center text-[10px] text-slate-400 font-mono">10:45 AM</div>

            {/* Notification Card */}
            <div className="bg-slate-700/80 backdrop-blur-md rounded-2xl p-3 border border-slate-600/50 shadow-md space-y-1">
              <div className="flex items-center justify-between text-[9px] text-amber-400 font-bold">
                <span className="flex items-center gap-1">
                  <Bell className="w-3 h-3" /> ASRGH Admin
                </span>
                <span className="text-slate-400">now</span>
              </div>
              <h5 className="font-bold text-white text-xs leading-tight">
                {title || 'Upcoming Community Assembly'}
              </h5>
              <p className="text-[10px] text-slate-300 line-clamp-2">
                {message || 'Tap to view full circular notice, venue map directions and registration checklist.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Broadcast History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <span>Broadcast Logs & Transmission History</span>
          </h4>
          <span className="text-[10px] text-slate-500">{notifications.length} Broadcasts Sent</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Subject & Message</th>
                <th className="py-3 px-4">Channel / Deep Link</th>
                <th className="py-3 px-4">Operator</th>
                <th className="py-3 px-4">Recipients</th>
                <th className="py-3 px-4">Sent At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {notifications.map((n) => (
                <tr key={n.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 max-w-sm">
                    <span className="font-bold text-slate-900 block">{n.title}</span>
                    <p className="text-slate-500 text-[11px] line-clamp-1">{n.message}</p>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    <span className="px-2 py-0.5 rounded bg-slate-100 uppercase text-[9px]">
                      {n.destination_type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700">{n.sender_name}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                    {n.targeted_devices} devices
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[10px]">{n.sent_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
