import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar,
  Clock,
  User,
  MessageSquare,
  Phone,
  Video,
  MapPin,
  CheckCircle,
  AlertCircle,
  Loader2,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import ResponsiveSidebar from '@/components/navigation/ResponsiveSidebar';
import MobileNavigation from '@/components/navigation/MobileNavigation';
import { useMediaQuery } from '@mui/material';
import { appointmentAPI, appointmentUtils, type Appointment } from '@/lib/api/appointments';

const PatientAppointments = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string;
    message: string;
    sender: 'patient' | 'practitioner';
    timestamp: string;
  }>>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const getUserName = () => {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return 'Patient';
      const user = JSON.parse(raw);
      return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Patient';
    } catch (e) {
      return 'Patient';
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      // Get confirmed and requested appointments
      const data = await appointmentAPI.getAppointments({});
      const relevantAppointments = data.appointments.filter(apt => 
        apt.status === 'confirmed' || apt.status === 'requested'
      );
      setAppointments(relevantAppointments);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load appointments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadChatMessages = async (appointmentId: string) => {
    try {
      setLoadingMessages(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/chats/appointment/${appointmentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const chatResponseData = await response.json();
        const chatData = chatResponseData.data || chatResponseData; // Handle both formats
        const formattedMessages = (chatData.messages || []).map((msg: any) => ({
          id: msg._id,
          message: msg.content,
          sender: msg.senderModel === 'Patient' ? 'patient' : 'practitioner',
          timestamp: msg.timestamp
        }));
        setChatMessages(formattedMessages);
      } else {
        // No chat exists yet, start with empty messages
        setChatMessages([]);
      }
    } catch (error) {
      console.error('Error loading chat messages:', error);
      setChatMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleAppointmentSelect = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    loadChatMessages(appointment._id);
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || !selectedAppointment) return;

    try {
      const token = localStorage.getItem('token');
      
      // Get or create a chat for this appointment (backend handles creation automatically)
      console.log('Trying to get chat for appointment:', selectedAppointment._id);
      const chatResponse = await fetch(`/api/chats/appointment/${selectedAppointment._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      let chatId;
      if (chatResponse.ok) {
        const chatResponseData = await chatResponse.json();
        console.log('Chat found/created:', chatResponseData);
        const chatData = chatResponseData.data || chatResponseData; // Handle both formats
        chatId = chatData._id;
      } else {
        const errorText = await chatResponse.text();
        console.error('Failed to get/create chat:', errorText);
        throw new Error('Failed to get/create chat');
      }

      console.log('Using chatId:', chatId);
      if (!chatId) {
        throw new Error('No chat ID available');
      }

      // Send the message
      const messageResponse = await fetch(`/api/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: chatMessage
        })
      });

      if (messageResponse.ok) {
        const newMessage = {
          id: Date.now().toString(),
          message: chatMessage,
          sender: 'patient' as const,
          timestamp: new Date().toISOString()
        };

        setChatMessages(prev => [...prev, newMessage]);
        setChatMessage('');

        toast({
          title: 'Message sent',
          description: 'Your message has been sent to the practitioner',
        });
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'requested':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'requested':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {!isMobile && (
        <ResponsiveSidebar 
          userType="patient" 
          userName={getUserName()} 
          userRole="Patient" 
        />
      )}
      
      <div className={`${!isMobile ? 'ml-64' : ''}`}>
        <main className="p-6">
          {isMobile && <div className="pb-20" />}
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-foreground mb-2">My Appointments</h1>
            <p className="text-muted-foreground">Manage your scheduled appointments and communicate with practitioners</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Appointments List */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Scheduled Appointments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px]">
                    {appointments.length === 0 ? (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No appointments scheduled</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {appointments.map((appointment) => (
                          <Card 
                            key={appointment._id}
                            className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                              selectedAppointment?._id === appointment._id ? 'ring-2 ring-primary' : ''
                            }`}
                            onClick={() => handleAppointmentSelect(appointment)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                    <User className="h-5 w-5 text-primary" />
                                  </div>
                                  <div>
                                    <h4 className="font-medium">
                                      Dr. {appointment.practitionerId.firstName} {appointment.practitionerId.lastName}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                      {appointment.practitionerId.specialization}
                                    </p>
                                  </div>
                                </div>
                                <Badge className={getStatusColor(appointment.status)}>
                                  {getStatusIcon(appointment.status)}
                                  <span className="ml-1 capitalize">{appointment.status}</span>
                                </Badge>
                              </div>
                              
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span>{appointmentUtils.formatDate(appointment.date)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <span>{appointmentUtils.formatSlotTime(appointment.slotStartUtc)}</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </motion.div>

            {/* Appointment Details and Chat */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2"
            >
              {selectedAppointment ? (
                <Card className="h-[700px] flex flex-col">
                  <CardHeader className="flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Dr. {selectedAppointment.practitionerId.firstName} {selectedAppointment.practitionerId.lastName}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Phone className="h-4 w-4 mr-2" />
                          Call
                        </Button>
                        <Button variant="outline" size="sm">
                          <Video className="h-4 w-4 mr-2" />
                          Video Call
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {appointmentUtils.formatDate(selectedAppointment.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {appointmentUtils.formatSlotTime(selectedAppointment.slotStartUtc)}
                      </span>
                      <Badge className={getStatusColor(selectedAppointment.status)}>
                        {getStatusIcon(selectedAppointment.status)}
                        <span className="ml-1 capitalize">{selectedAppointment.status}</span>
                      </Badge>
                    </div>
                  </CardHeader>

                  <Tabs defaultValue="chat" className="flex-1 flex flex-col">
                    <TabsList className="mx-6">
                      <TabsTrigger value="chat" className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Chat
                      </TabsTrigger>
                      <TabsTrigger value="details" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Details
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="chat" className="flex-1 flex flex-col mt-0">
                      {/* Chat Messages */}
                      {/* Messages */}
                      <ScrollArea className="flex-1 p-4">
                        <div className="space-y-4">
                          {chatMessages.length === 0 ? (
                            <div className="text-center py-8">
                              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                              <p className="text-muted-foreground">No messages yet. Start a conversation!</p>
                            </div>
                          ) : (
                            chatMessages.map((msg) => (
                              <div
                                key={msg.id}
                                className={`flex ${msg.sender === 'patient' ? 'justify-end' : 'justify-start'}`}
                              >
                                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                  msg.sender === 'patient'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-100 text-gray-900'
                                }`}>
                                  <p className="text-sm">{msg.message}</p>
                                  <div className="flex items-center justify-between mt-1">
                                    <p className={`text-xs ${
                                      msg.sender === 'patient' ? 'text-green-100' : 'text-gray-500'
                                    }`}>
                                      {new Date(msg.timestamp).toLocaleTimeString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                          <div ref={messagesEndRef} />
                        </div>
                      </ScrollArea>

                      {/* Message Input */}
                      <div className="border-t p-4">
                        <div className="flex space-x-2">
                          <Input
                            placeholder="Type your message..."
                            value={chatMessage}
                            onChange={(e) => setChatMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            className="flex-1"
                          />
                          <Button 
                            onClick={handleSendMessage}
                            disabled={!chatMessage.trim()}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="details" className="flex-1 p-6">
                      <div className="space-y-6">
                        <div>
                          <h3 className="font-semibold mb-2">Appointment Information</h3>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Date:</span>
                              <p className="font-medium">{appointmentUtils.formatDate(selectedAppointment.date)}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Time:</span>
                              <p className="font-medium">{appointmentUtils.formatSlotTime(selectedAppointment.slotStartUtc)}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Duration:</span>
                              <p className="font-medium">{selectedAppointment.duration} minutes</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Status:</span>
                              <Badge className={getStatusColor(selectedAppointment.status)}>
                                {getStatusIcon(selectedAppointment.status)}
                                <span className="ml-1 capitalize">{selectedAppointment.status}</span>
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {selectedAppointment.notes && (
                          <div>
                            <h3 className="font-semibold mb-2">Notes</h3>
                            <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                              {selectedAppointment.notes}
                            </p>
                          </div>
                        )}

                        <div>
                          <h3 className="font-semibold mb-2">Practitioner Information</h3>
                          <div className="bg-muted p-4 rounded-lg">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                <User className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-medium">
                                  Dr. {selectedAppointment.practitionerId.firstName} {selectedAppointment.practitionerId.lastName}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {selectedAppointment.practitionerId.specialization}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </Card>
              ) : (
                <Card className="h-[700px] flex items-center justify-center">
                  <div className="text-center">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Select an Appointment</h3>
                    <p className="text-muted-foreground">Choose an appointment from the list to view details and chat with your practitioner</p>
                  </div>
                </Card>
              )}
            </motion.div>
          </div>
        </main>
      </div>

      {isMobile && <MobileNavigation userType="patient" />}
    </div>
  );
};

export default PatientAppointments;