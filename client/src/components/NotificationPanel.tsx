import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Send, User, Clock, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface Ticket {
  id: string;
  operatorName: string;
  operatorRole: string;
  station: string;
  issue: string;
  priority: "low" | "medium" | "high";
  timestamp: Date;
  status: "open" | "assigned" | "resolved";
  assignedTo?: string;
  managerResponse?: string;
}

interface NotificationPanelProps {
  tickets: Ticket[];
  onClose: () => void;
  onAssignTicket: (ticketId: string, operatorId: string, response: string) => void;
  onResolveTicket: (ticketId: string) => void;
}

export default function NotificationPanel({
  tickets,
  onClose,
  onAssignTicket,
  onResolveTicket
}: NotificationPanelProps) {
  const [activeTicket, setActiveTicket] = useState<string | null>(null);
  const [response, setResponse] = useState("");
  const [assignTo, setAssignTo] = useState("");

  // todo: remove mock functionality - get real operators from backend
  const availableOperators = [
    { id: "op1", name: "Jean Dupont", role: "Cooling Room" },
    { id: "op2", name: "Marie Claire", role: "Quality Control" },
    { id: "op3", name: "Pierre Martin", role: "Packaging" },
    { id: "op4", name: "Sophie Laurent", role: "Mixing Room" },
  ];

  const handleSendResponse = (ticketId: string) => {
    if (response.trim() && assignTo) {
      onAssignTicket(ticketId, assignTo, response);
      setResponse("");
      setAssignTo("");
      setActiveTicket(null);
    }
  };

  const openTickets = tickets.filter(t => t.status === "open");
  const assignedTickets = tickets.filter(t => t.status === "assigned");
  const resolvedTickets = tickets.filter(t => t.status === "resolved");

  return (
    <div className="fixed inset-0 bg-background/80 z-50 flex justify-end" onClick={onClose}>
      <div 
        className="w-full max-w-2xl bg-background border-l shadow-xl flex flex-col h-full"
        onClick={(e) => e.stopPropagation()}
        data-testid="notification-panel"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-xl font-semibold">Notifications & Tickets</h2>
            <p className="text-sm text-muted-foreground">
              {openTickets.length} open, {assignedTickets.length} assigned
            </p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            data-testid="button-close-panel"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {/* Open Tickets */}
          {openTickets.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-destructive flex items-center gap-2">
                Open Tickets ({openTickets.length})
              </h3>
              {openTickets.map(ticket => (
                <Card 
                  key={ticket.id} 
                  className={cn(
                    "p-4 border-l-4",
                    ticket.priority === "high" && "border-l-destructive",
                    ticket.priority === "medium" && "border-l-warning",
                    ticket.priority === "low" && "border-l-muted-foreground"
                  )}
                  data-testid={`ticket-${ticket.id}`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={ticket.priority === "high" ? "destructive" : "secondary"}
                            className="text-xs"
                          >
                            {ticket.priority.toUpperCase()}
                          </Badge>
                          <span className="text-sm font-medium">{ticket.station}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>{ticket.operatorName} - {ticket.operatorRole}</span>
                        </div>
                        <p className="text-sm mt-2">{ticket.issue}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(ticket.timestamp, { addSuffix: true })}
                        </div>
                      </div>
                    </div>

                    {/* Response Form */}
                    {activeTicket === ticket.id ? (
                      <div className="space-y-3 pt-3 border-t">
                        <div>
                          <Label className="text-xs">Assign to Operator</Label>
                          <Select value={assignTo} onValueChange={setAssignTo}>
                            <SelectTrigger data-testid={`select-assign-${ticket.id}`}>
                              <SelectValue placeholder="Select operator..." />
                            </SelectTrigger>
                            <SelectContent>
                              {availableOperators.map(op => (
                                <SelectItem key={op.id} value={op.id}>
                                  {op.name} - {op.role}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">Instructions / Response</Label>
                          <Textarea
                            placeholder="Provide instructions or response..."
                            value={response}
                            onChange={(e) => setResponse(e.target.value)}
                            rows={3}
                            data-testid={`textarea-response-${ticket.id}`}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSendResponse(ticket.id)}
                            disabled={!assignTo || !response.trim()}
                            data-testid={`button-send-${ticket.id}`}
                          >
                            <Send className="h-3 w-3 mr-1" />
                            Assign & Notify
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setActiveTicket(null)}
                            data-testid={`button-cancel-${ticket.id}`}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => setActiveTicket(ticket.id)}
                        data-testid={`button-respond-${ticket.id}`}
                      >
                        Respond & Assign
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Assigned Tickets */}
          {assignedTickets.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-warning-foreground flex items-center gap-2">
                Assigned Tickets ({assignedTickets.length})
              </h3>
              {assignedTickets.map(ticket => (
                <Card key={ticket.id} className="p-4 border-l-4 border-l-warning">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">ASSIGNED</Badge>
                          <span className="text-sm font-medium">{ticket.station}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{ticket.issue}</p>
                        {ticket.assignedTo && (
                          <p className="text-xs text-muted-foreground">
                            Assigned to: {availableOperators.find(op => op.id === ticket.assignedTo)?.name}
                          </p>
                        )}
                        {ticket.managerResponse && (
                          <div className="mt-2 p-2 bg-muted rounded text-xs">
                            <p className="font-medium">Your instructions:</p>
                            <p className="text-muted-foreground">{ticket.managerResponse}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onResolveTicket(ticket.id)}
                      data-testid={`button-resolve-${ticket.id}`}
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Mark as Resolved
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Resolved Tickets */}
          {resolvedTickets.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-success flex items-center gap-2">
                Recently Resolved ({resolvedTickets.length})
              </h3>
              {resolvedTickets.map(ticket => (
                <Card key={ticket.id} className="p-4 opacity-60">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">RESOLVED</Badge>
                        <span className="text-sm">{ticket.station}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{ticket.issue}</p>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  </div>
                </Card>
              ))}
            </div>
          )}

          {tickets.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No notifications at the moment</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
