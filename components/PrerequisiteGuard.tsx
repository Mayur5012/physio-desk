import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/ui/Modal";
import api from "@/lib/api";
import { AlertTriangle, Users, Calendar } from "lucide-react";

interface AppointmentGuardProps {
  children: React.ReactNode;
}

export function AppointmentGuard({ children }: AppointmentGuardProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [clientCount, setClientCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkClients = async () => {
      try {
        const response = await api.get("/clients?status=ACTIVE&limit=1");
        const count = response.data.total || 0;
        setClientCount(count);
        if (count === 0) {
          setShowModal(true);
        }
      } catch (err) {
        // If API fails, allow access
      } finally {
        setLoading(false);
      }
    };

    checkClients();
  }, []);

  const handleNavigateToClients = () => {
    router.push("/clients/new");
  };

  if (loading) {
    return <div>{children}</div>;
  }

  return (
    <>
      {children}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-orange-100 p-4 rounded-full">
              <Users size={32} className="text-orange-600" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900 mb-2">No Patients Found</h2>
            <p className="text-gray-600 text-sm">
              Please add at least one patient before booking an appointment.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowModal(false)}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg font-bold hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleNavigateToClients}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Users size={16} />
              Add Patient
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

interface SessionGuardProps {
  children: React.ReactNode;
}

export function SessionGuard({ children }: SessionGuardProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [appointmentCount, setAppointmentCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAppointments = async () => {
      try {
        const response = await api.get("/appointments?limit=1");
        const count = response.data.total || 0;
        setAppointmentCount(count);
        if (count === 0) {
          setShowModal(true);
        }
      } catch (err) {
        // If API fails, allow access
      } finally {
        setLoading(false);
      }
    };

    checkAppointments();
  }, []);

  const handleNavigateToAppointments = () => {
    router.push("/appointments/new");
  };

  if (loading) {
    return <div>{children}</div>;
  }

  return (
    <>
      {children}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-orange-100 p-4 rounded-full">
              <Calendar size={32} className="text-orange-600" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900 mb-2">No Appointments Found</h2>
            <p className="text-gray-600 text-sm">
              Please book at least one appointment before creating a session.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowModal(false)}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg font-bold hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleNavigateToAppointments}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Calendar size={16} />
              Book Appointment
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
