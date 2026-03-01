import { supabase } from "@/integrations/supabase/client";

export interface Event {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  location: string | null;
  start_time: string;
  end_time: string | null;
  max_attendees: number | null;
  created_by: string;
  profiles: {
    full_name: string;
  };
  rsvp_count?: number;
  user_rsvp?: string | null;
}

export const EventService = {
  async fetchUpcomingEvents(userId?: string): Promise<Event[]> {
    // First get events
    const { data: eventsData, error: eventsError } = await supabase
      .from("campus_events")
      .select("*")
      .gte("start_time", new Date().toISOString())
      .order("start_time", { ascending: true });

    if (eventsError) throw eventsError;
    if (!eventsData || eventsData.length === 0) return [];

    // Get creator profiles
    const creatorIds = eventsData.map(e => e.created_by);
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", creatorIds);

    // Get RSVP counts and user's RSVP status
    const eventsWithData = await Promise.all(
      eventsData.map(async (event) => {
        const { count } = await supabase
          .from("event_rsvps")
          .select("*", { count: "exact", head: true })
          .eq("event_id", event.id)
          .eq("status", "going");

        let userRsvp = null;
        if (userId) {
          const { data } = await supabase
            .from("event_rsvps")
            .select("status")
            .eq("event_id", event.id)
            .eq("user_id", userId)
            .maybeSingle();
          userRsvp = data;
        }

        const profile = profilesData?.find(p => p.id === event.created_by);

        return {
          ...event,
          profiles: {
            full_name: profile?.full_name || "Unknown",
          },
          rsvp_count: count || 0,
          user_rsvp: userRsvp?.status || null,
        } as Event;
      })
    );

    return eventsWithData;
  },

  async createEvent(eventData: any, userId: string) {
    const { data, error } = await supabase.from("campus_events").insert({
      ...eventData,
      max_attendees: eventData.max_attendees ? parseInt(eventData.max_attendees) : null,
      created_by: userId,
    });

    if (error) throw error;
    return data;
  },

  async handleRSVP(eventId: string, userId: string, status: string) {
    const { data, error } = await supabase
      .from("event_rsvps")
      .upsert({
        event_id: eventId,
        user_id: userId,
        status,
      });

    if (error) throw error;
    return data;
  }
};
