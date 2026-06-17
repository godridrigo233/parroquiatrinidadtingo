import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function AttendanceReport({ meetingId }: { meetingId: string }) {
  const [report, setReport] = useState<{ present: any[], absent: any[] }>({ present: [], absent: [] });

  useEffect(() => {
    const fetchReport = async () => {
      // 1. Traer todos los catequistas
      const { data: allCatechists } = await supabase.from("catechists").select("*");
      // 2. Traer los que asistieron a esta reunión
      const { data: attendees } = await supabase
        .from("attendance")
        .select("catechist_id")
        .eq("meeting_id", meetingId);

      const attendedIds = attendees?.map(a => a.catechist_id) || [];
      
      const present = allCatechists?.filter(c => attendedIds.includes(c.id)) || [];
      const absent = allCatechists?.filter(c => !attendedIds.includes(c.id)) || [];
      
      setReport({ present, absent });
    };

    fetchReport();
  }, [meetingId]);

  return (
    <div className="mt-8 grid md:grid-cols-2 gap-6">
      <div className="p-4 bg-green-50 rounded-xl border border-green-200">
        <h4 className="font-bold text-green-800 mb-2">Asistieron ({report.present.length})</h4>
        <ul className="text-sm space-y-1">
          {report.present.map(c => <li key={c.id}>✅ {c.full_name}</li>)}
        </ul>
      </div>
      <div className="p-4 bg-red-50 rounded-xl border border-red-200">
        <h4 className="font-bold text-red-800 mb-2">Faltaron ({report.absent.length})</h4>
        <ul className="text-sm space-y-1">
          {report.absent.map(c => <li key={c.id}>❌ {c.full_name}</li>)}
        </ul>
      </div>
    </div>
  );
}