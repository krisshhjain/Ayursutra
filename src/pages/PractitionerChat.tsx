import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Search, Clock } from 'lucide-react';
import ResponsiveSidebar from '@/components/navigation/ResponsiveSidebar';
import MobileNavigation from '@/components/navigation/MobileNavigation';

// Helper function to format time
const formatDistanceToNow = (date: Date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

interface Message {
  _id: string;
  sender: 'patient' | 'practitioner';
  content: string;
  timestamp: Date;
  senderName: string;
}

interface Chat {
  _id: string;
  appointmentId?: {
    _id: string;
    patientId?: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    sessionDate?: Date;
    status?: string;
  };
  appointment?: {
    _id: string;
    date?: Date;
    status?: string;
  };
  patient?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  practitioner?: {
    _id: string;
    firstName: string;
    lastName: string;
    specialization?: string;
  };
  messages: Message[];
  lastMessage?: {
    content: string;
    timestamp: Date;
    sender: 'patient' | 'practitioner';
  };
  unreadCount?: {
    patient: number;
    practitioner: number;
  } | number;
}

const PractitionerChat: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock data for development
  const mockChats: Chat[] = [
    {
      _id: '1',
      appointmentId: {
        _id: 'app1',
        patientId: {
          _id: 'patient1',
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah.johnson@email.com'
        },
        sessionDate: new Date('2024-01-20'),
        status: 'completed'
      },
      messages: [
        {
          _id: 'm1',
          sender: 'patient',
          content: 'Hello Dr. Sharma, I wanted to follow up on my last consultation.',
          timestamp: new Date('2024-01-21T10:30:00'),
          senderName: 'Sarah Johnson'
        },
        {
          _id: 'm2',
          sender: 'practitioner',
          content: 'Hello Sarah! I hope you are feeling better. How has the herbal treatment been working for you?',
          timestamp: new Date('2024-01-21T11:00:00'),
          senderName: 'Dr. Sharma'
        },
        {
          _id: 'm3',
          sender: 'patient',
          content: 'The treatment has been helping a lot! My digestive issues have improved significantly.',
          timestamp: new Date('2024-01-21T11:15:00'),
          senderName: 'Sarah Johnson'
        }
      ],
      unreadCount: 0
    },
    {
      _id: '2',
      appointmentId: {
        _id: 'app2',
        patientId: {
          _id: 'patient2',
          firstName: 'Michael',
          lastName: 'Chen',
          email: 'michael.chen@email.com'
        },
        sessionDate: new Date('2024-01-18'),
        status: 'completed'
      },
      messages: [
        {
          _id: 'm4',
          sender: 'patient',
          content: 'Doctor, I have a question about the meditation techniques you recommended.',
          timestamp: new Date('2024-01-22T09:00:00'),
          senderName: 'Michael Chen'
        }
      ],
      unreadCount: 1
    },
    {
      _id: '3',
      appointmentId: {
        _id: 'app3',
        patientId: {
          _id: 'patient3',
          firstName: 'Emily',
          lastName: 'Williams',
          email: 'emily.williams@email.com'
        },
        sessionDate: new Date('2024-01-25'),
        status: 'confirmed'
      },
      messages: [
        {
          _id: 'm5',
          sender: 'patient',
          content: 'Hi Doctor, I wanted to confirm my upcoming appointment and ask about preparation.',
          timestamp: new Date('2024-01-22T14:30:00'),
          senderName: 'Emily Williams'
        },
        {
          _id: 'm6',
          sender: 'practitioner',
          content: 'Hello Emily! Yes, your appointment is confirmed for January 25th. Please continue your current dietary restrictions.',
          timestamp: new Date('2024-01-22T15:00:00'),
          senderName: 'Dr. Sharma'
        }
      ],
      unreadCount: 0
    }
  ];

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/chats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('Practitioner chats response:', responseData);
        const data = responseData.data || responseData; // Handle both formats
        
        // Transform the messages to ensure sender field is properly set
        const transformedData = Array.isArray(data) ? data.map(chat => ({
          ...chat,
          messages: (chat.messages || []).map((msg: any) => ({
            ...msg,
            sender: msg.senderModel === 'Patient' ? 'patient' : 'practitioner'
          }))
        })) : [];
        
        console.log('Processed chats data:', transformedData);
        setChats(transformedData);
      } else {
        console.error('Failed to fetch chats, status:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        setChats([]); // Set empty array on error
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
      setChats([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/chats/${selectedChat._id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: newMessage.trim()
        })
      });

      if (response.ok) {
        const message: Message = {
          _id: Date.now().toString(),
          sender: 'practitioner',
          content: newMessage.trim(),
          timestamp: new Date(),
          senderName: 'Dr. Sharma'
        };

        // Update the selected chat
        const updatedChat = {
          ...selectedChat,
          messages: [...selectedChat.messages, message]
        };

        // Update chats list
        const updatedChats = chats.map(chat => 
          chat._id === selectedChat._id ? updatedChat : chat
        );

        setChats(updatedChats);
        setSelectedChat(updatedChat);
        setNewMessage('');
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Could add a toast notification here
    }
  };

  const handleChatSelect = async (chat: Chat) => {
    setSelectedChat(chat);
    
    // Mark messages as read
    const practitionerUnreadCount = typeof chat.unreadCount === 'object' 
      ? chat.unreadCount?.practitioner || 0 
      : chat.unreadCount || 0;
      
    if (practitionerUnreadCount > 0) {
      try {
        const token = localStorage.getItem('token');
        await fetch(`/api/chats/${chat._id}/read`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const updatedChats = chats.map(c => 
          c._id === chat._id ? { 
            ...c, 
            unreadCount: typeof c.unreadCount === 'object' 
              ? { ...c.unreadCount, practitioner: 0 }
              : 0
          } : c
        );
        setChats(updatedChats);
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    }
  };

  const filteredChats = Array.isArray(chats) ? chats.filter(chat => {
    const patient = chat.patient || chat.appointmentId?.patientId;
    return patient && 
    `${patient.firstName} ${patient.lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
  }) : [];

  const getLastMessage = (chat: Chat) => {
    if (chat.messages.length === 0) return null;
    return chat.messages[chat.messages.length - 1];
  };

  const formatMessageTime = (timestamp: Date) => {
    return formatDistanceToNow(new Date(timestamp));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <ResponsiveSidebar 
          userType="practitioner" 
          userName="Dr. Practitioner" 
          userRole="Practitioner" 
        />
        <div className="pl-0 md:pl-64">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">Loading conversations...</p>
            </div>
          </div>
        </div>
        <MobileNavigation userType="practitioner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ResponsiveSidebar 
        userType="practitioner" 
        userName="Dr. Practitioner" 
        userRole="Practitioner" 
      />
      <div className="pl-0 md:pl-64">
        <main className="p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <MessageCircle className="h-8 w-8 text-green-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Patient Conversations</h1>
                <p className="text-gray-600">Communicate with your patients</p>
              </div>
            </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Chat List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Conversations</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-320px)]">
              {filteredChats.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No conversations found
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredChats.map((chat) => {
                    const lastMessage = getLastMessage(chat);
                    const patient = chat.patient || chat.appointmentId?.patientId;
                    
                    if (!patient) return null;
                    
                    return (
                      <div
                        key={chat._id}
                        onClick={() => handleChatSelect(chat)}
                        className={`p-4 cursor-pointer hover:bg-gray-50 border-b transition-colors ${
                          selectedChat?._id === chat._id ? 'bg-green-50 border-green-200' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-green-100 text-green-700">
                              {patient.firstName[0]}{patient.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {patient.firstName} {patient.lastName}
                              </p>
                              {(() => {
                                const practitionerUnreadCount = typeof chat.unreadCount === 'object' 
                                  ? chat.unreadCount?.practitioner || 0 
                                  : chat.unreadCount || 0;
                                return practitionerUnreadCount > 0 && (
                                  <Badge variant="destructive" className="text-xs">
                                    {practitionerUnreadCount}
                                  </Badge>
                                );
                              })()}
                            </div>
                            
                            {lastMessage && (
                              <>
                                <p className="text-xs text-gray-500 truncate mt-1">
                                  {lastMessage.content}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {formatMessageTime(lastMessage.timestamp)}
                                </p>
                              </>
                            )}
                            
                            <div className="flex items-center gap-2 mt-2">
                              {(chat.appointment?.status || chat.appointmentId?.status) && (
                                <Badge 
                                  variant={(chat.appointment?.status || chat.appointmentId?.status) === 'completed' ? 'secondary' : 'default'}
                                  className="text-xs"
                                >
                                  {chat.appointment?.status || chat.appointmentId?.status}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <Card className="lg:col-span-2">
          {selectedChat ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-green-100 text-green-700">
                      {(() => {
                        const patient = selectedChat.patient || selectedChat.appointmentId?.patientId;
                        return patient ? `${patient.firstName[0]}${patient.lastName[0]}` : 'P';
                      })()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">
                      {(() => {
                        const patient = selectedChat.patient || selectedChat.appointmentId?.patientId;
                        return patient ? `${patient.firstName} ${patient.lastName}` : 'Patient';
                      })()}
                    </CardTitle>
                    <p className="text-sm text-gray-500">
                      Appointment: {(() => {
                        const appointmentDate = selectedChat.appointment?.date || selectedChat.appointmentId?.sessionDate;
                        return appointmentDate ? new Date(appointmentDate).toLocaleDateString() : 'N/A';
                      })()}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex flex-col h-[calc(100vh-380px)]">
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {selectedChat.messages.map((message) => (
                      <div
                        key={message._id}
                        className={`flex ${message.sender === 'practitioner' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender === 'practitioner'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          <div className="flex items-center justify-between mt-1">
                            <p className={`text-xs ${
                              message.sender === 'practitioner' ? 'text-green-100' : 'text-gray-500'
                            }`}>
                              {formatMessageTime(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="border-t p-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-500">
                  Choose a patient from the list to start messaging
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
        </main>
      </div>
      <MobileNavigation userType="practitioner" />
    </div>
  );
};

export default PractitionerChat;