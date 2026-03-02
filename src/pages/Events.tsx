import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import PullToRefresh from '@/components/PullToRefresh';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Calendar, MapPin, Users, Plus, Clock, CheckCircle2, Star } from "lucide-react";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

// Import Event from EventService instead
import { EventService, type Event } from "@/services/EventService";

const Events = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const isMobile = useIsMobile();

  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    event_type: "social",
    location: "",
    start_time: "",
    end_time: "",
    max_attendees: "",
  });

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user]);

  const fetchEvents = async () => {
    if (!user) return;
    try {
      const eventsWithData = await EventService.fetchUpcomingEvents(user.id);
      setEvents(eventsWithData);
    } catch (error) {
      console.error("Failed to fetch events:", error);
      toast.error("Failed to load events");
    }
  };

  const createEvent = async () => {
    if (!user) return;

    if (!newEvent.title || !newEvent.start_time) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      await EventService.createEvent(newEvent, user.id);
      toast.success("Event created successfully!");
      setShowCreateDrawer(false);
      setNewEvent({
        title: "",
        description: "",
        event_type: "social",
        location: "",
        start_time: "",
        end_time: "",
        max_attendees: "",
      });
      fetchEvents();
    } catch (error) {
      console.error("Failed to create event:", error);
      toast.error("Failed to create event");
    }
  };

  const handleRSVP = async (eventId: string, status: string) => {
    if (!user) return;

    try {
      await EventService.handleRSVP(eventId, user.id, status);
      toast.success(status === "going" ? "You're attending!" : "RSVP updated");
      fetchEvents();
    } catch (error) {
      console.error("Failed to update RSVP:", error);
      toast.error("Failed to update RSVP");
    }
  };

  const getEventTypeBadge = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      academic: "default",
      social: "secondary",
      sports: "outline",
      club: "secondary",
      career: "default",
      other: "outline",
    };
    return variants[type] || "secondary";
  };

  const filteredEvents = events.filter(event => {
    if (filter === "all") return true;
    if (filter === "attending") return event.user_rsvp === "going";
    if (filter === "interested") return event.user_rsvp === "interested";
    return event.event_type === filter;
  });

  const handleRefresh = useCallback(async () => {
    await fetchEvents();
  }, [user]);

  const CreateEventForm = () => (
    <div className="space-y-4 px-1">
      <div>
        <Label className="text-sm font-medium">Event Title *</Label>
        <Input
          value={newEvent.title}
          onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
          placeholder="Study Group for Finals"
          className="mt-1.5"
        />
      </div>
      <div>
        <Label className="text-sm font-medium">Event Type *</Label>
        <Select
          value={newEvent.event_type}
          onValueChange={(value) => setNewEvent({ ...newEvent, event_type: value })}
        >
          <SelectTrigger className="mt-1.5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="academic">Academic</SelectItem>
            <SelectItem value="social">Social</SelectItem>
            <SelectItem value="sports">Sports</SelectItem>
            <SelectItem value="club">Club Activity</SelectItem>
            <SelectItem value="career">Career</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-sm font-medium">Description</Label>
        <Textarea
          value={newEvent.description}
          onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
          placeholder="Describe the event..."
          rows={2}
          className="mt-1.5"
        />
      </div>
      <div>
        <Label className="text-sm font-medium">Location</Label>
        <Input
          value={newEvent.location}
          onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
          placeholder="Library Room 301"
          className="mt-1.5"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-sm font-medium">Start *</Label>
          <Input
            type="datetime-local"
            value={newEvent.start_time}
            onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
            className="mt-1.5 text-sm"
          />
        </div>
        <div>
          <Label className="text-sm font-medium">End</Label>
          <Input
            type="datetime-local"
            value={newEvent.end_time}
            onChange={(e) => setNewEvent({ ...newEvent, end_time: e.target.value })}
            className="mt-1.5 text-sm"
          />
        </div>
      </div>
      <div>
        <Label className="text-sm font-medium">Max Attendees</Label>
        <Input
          type="number"
          value={newEvent.max_attendees}
          onChange={(e) => setNewEvent({ ...newEvent, max_attendees: e.target.value })}
          placeholder="Leave empty for unlimited"
          className="mt-1.5"
        />
      </div>
      <Button onClick={createEvent} className="w-full mt-2">
        Create Event
      </Button>
    </div>
  );

  return (
    <PullToRefresh onRefresh={handleRefresh} className="h-full">
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold flex items-center gap-2">
              <Calendar className="h-6 w-6 sm:h-8 sm:w-8" />
              Campus Events
            </h1>
            <p className="text-muted-foreground text-sm mt-1 hidden sm:block">
              Discover and attend campus activities
            </p>
          </div>
          <Drawer open={showCreateDrawer} onOpenChange={setShowCreateDrawer}>
            <DrawerTrigger asChild>
              <Button size={isMobile ? "sm" : "default"} className="gap-1.5">
                <Plus className="h-4 w-4" />
                <span className="hidden xs:inline">Create</span>
              </Button>
            </DrawerTrigger>
            <DrawerContent className="max-h-[90vh]">
              <DrawerHeader className="pb-2">
                <DrawerTitle>Create Event</DrawerTitle>
                <DrawerDescription>
                  Organize a new event for the campus
                </DrawerDescription>
              </DrawerHeader>
              <div className="overflow-y-auto px-4 pb-8">
                <CreateEventForm />
              </div>
            </DrawerContent>
          </Drawer>
        </div>

        {/* Tabs - scrollable on mobile */}
        <Tabs defaultValue="all" onValueChange={setFilter}>
          <div className="overflow-x-auto -mx-4 px-4 pb-2">
            <TabsList className="mb-4 inline-flex w-max min-w-full sm:w-auto">
              <TabsTrigger value="all" className="text-xs sm:text-sm">All</TabsTrigger>
              <TabsTrigger value="attending" className="text-xs sm:text-sm">Attending</TabsTrigger>
              <TabsTrigger value="interested" className="text-xs sm:text-sm">Interested</TabsTrigger>
              <TabsTrigger value="academic" className="text-xs sm:text-sm">Academic</TabsTrigger>
              <TabsTrigger value="social" className="text-xs sm:text-sm">Social</TabsTrigger>
              <TabsTrigger value="sports" className="text-xs sm:text-sm">Sports</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={filter} className="mt-0">
            <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
              {filteredEvents.length === 0 ? (
                <Card className="md:col-span-2">
                  <CardContent className="p-8 sm:p-12 text-center text-muted-foreground">
                    <Calendar className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-base sm:text-lg">No events found</p>
                    <p className="text-sm mt-2">Be the first to create an event!</p>
                  </CardContent>
                </Card>
              ) : (
                filteredEvents.map((event) => (
                  <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-2 sm:pb-4">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base sm:text-xl truncate">{event.title}</CardTitle>
                          <CardDescription className="mt-0.5 text-xs sm:text-sm">
                            by {event.profiles.full_name}
                          </CardDescription>
                        </div>
                        <Badge variant={getEventTypeBadge(event.event_type)} className="text-xs shrink-0">
                          {event.event_type}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 sm:space-y-3 pt-0">
                      {event.description && (
                        <p className="text-xs sm:text-sm line-clamp-2">{event.description}</p>
                      )}
                      <div className="space-y-1.5 text-xs sm:text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                          <span className="truncate">{format(new Date(event.start_time), "PPp")}</span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                          {event.rsvp_count} attending
                          {event.max_attendees && ` / ${event.max_attendees} max`}
                        </div>
                      </div>
                      <div className="flex gap-2 pt-1 sm:pt-2">
                        {event.user_rsvp === "going" ? (
                          <Button
                            variant="default"
                            size="sm"
                            className="flex-1 h-8 text-xs sm:text-sm"
                            onClick={() => handleRSVP(event.id, "not_going")}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                            Attending
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 h-8 text-xs sm:text-sm"
                            onClick={() => handleRSVP(event.id, "going")}
                          >
                            Attend
                          </Button>
                        )}
                        <Button
                          variant={event.user_rsvp === "interested" ? "secondary" : "outline"}
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() =>
                            handleRSVP(
                              event.id,
                              event.user_rsvp === "interested" ? "not_going" : "interested"
                            )
                          }
                        >
                          <Star className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PullToRefresh>
  );
};

export default Events;
