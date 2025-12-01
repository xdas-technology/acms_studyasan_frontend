import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Users, Calendar, ArrowRight } from 'lucide-react';
import { chatService } from '@/services/api';
import type { Chat, User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AdminChatsPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [filteredChats, setFilteredChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllChats();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredChats(chats);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = chats.filter(chat => {
        // Search in participant names and emails
        const participantMatch = chat.participants.some(p =>
          p.user.name.toLowerCase().includes(query) ||
          p.user.email.toLowerCase().includes(query)
        );
        
        // Search in latest message
        const messageMatch = chat.messages?.[0]?.content?.toLowerCase().includes(query);
        
        return participantMatch || messageMatch;
      });
      setFilteredChats(filtered);
    }
  }, [searchQuery, chats]);

  const fetchAllChats = async () => {
    try {
      setLoading(true);
      const response = await chatService.getAllChats();
      setChats(response.data);
      setFilteredChats(response.data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getParticipantRoles = (chat: Chat): { students: User[]; teachers: User[] } => {
    const students = chat.participants
      .filter(p => p.user.role === 'STUDENT')
      .map(p => p.user);
    
    const teachers = chat.participants
      .filter(p => p.user.role === 'TEACHER')
      .map(p => p.user);
    
    return { students, teachers };
  };

  const formatDate = (date: string | Date): string => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">All Chats</h1>
          <p className="text-gray-600 mt-1">Monitor all conversations between students and teachers</p>
        </div>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search chats by participant name, email, or message content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Chats</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{chats.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {chats.filter(chat => {
                const lastMessage = chat.messages?.[0];
                if (!lastMessage) return false;
                const messageDate = new Date(lastMessage.created_at);
                const today = new Date();
                return messageDate.toDateString() === today.toDateString();
              }).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {chats.reduce((sum, chat) => sum + (chat._count?.messages || 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chats List */}
      {loading ? (
        <div className="text-center py-12">Loading chats...</div>
      ) : filteredChats.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">
              {searchQuery ? 'No chats found matching your search' : 'No chats found'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredChats.map((chat) => {
            const { students, teachers } = getParticipantRoles(chat);
            const lastMessage = chat.messages?.[0];

            return (
              <Card
                key={chat.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/dashboard/chats?chatId=${chat.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">
                          Chat #{chat.id}
                        </h3>
                        <Badge variant="outline">
                          {chat._count?.messages || 0} messages
                        </Badge>
                      </div>

                      {/* Participants */}
                      <div className="space-y-2 mb-3">
                        {students.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Badge className="bg-blue-500">Students</Badge>
                            <span className="text-sm text-gray-600">
                              {students.map(s => s.name).join(', ')}
                            </span>
                          </div>
                        )}
                        {teachers.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-500">Teachers</Badge>
                            <span className="text-sm text-gray-600">
                              {teachers.map(t => t.name).join(', ')}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Last Message */}
                      {lastMessage && (
                        <div className="bg-gray-50 p-3 rounded-md">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">
                              {lastMessage.sender.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(lastMessage.created_at)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {lastMessage.content || <em className="text-gray-400">[{lastMessage.message_type}]</em>}
                          </p>
                        </div>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/dashboard/chats?chatId=${chat.id}`);
                      }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
