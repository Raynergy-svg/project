import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Ticket, MessageSquare, Clock, CheckCircle, AlertCircle, Plus, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Link } from 'react-router-dom';

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'closed';
  priority: 'low' | 'medium' | 'high';
  category: string;
  created_at: string;
  updated_at: string;
}

export default function SupportTickets() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [ticketComments, setTicketComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/tickets', {
        params: { userId: user?.id }
      });
      setTickets(response.data.tickets || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError('Failed to load support tickets. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const viewTicket = async (ticket: SupportTicket) => {
    setActiveTicket(ticket);
    try {
      const response = await axios.get(`/api/tickets/${ticket.id}`, {
        params: { userId: user?.id }
      });
      setTicketComments(response.data.comments || []);
    } catch (err) {
      console.error('Error fetching ticket details:', err);
    }
  };

  const submitComment = async () => {
    if (!activeTicket || !newComment.trim()) return;

    try {
      setSubmittingComment(true);
      await axios.post(`/api/tickets/${activeTicket.id}/comment`, {
        userId: user?.id,
        content: newComment
      });
      setNewComment('');
      // Refresh ticket comments
      const response = await axios.get(`/api/tickets/${activeTicket.id}`, {
        params: { userId: user?.id }
      });
      setTicketComments(response.data.comments || []);
    } catch (err) {
      console.error('Error submitting comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const updateTicketStatus = async (status: 'open' | 'in_progress' | 'closed') => {
    if (!activeTicket) return;

    try {
      const response = await axios.put(`/api/tickets/${activeTicket.id}/status`, {
        userId: user?.id,
        status
      });
      
      // Update the ticket in the list
      setTickets(tickets.map(ticket => 
        ticket.id === activeTicket.id ? response.data.ticket : ticket
      ));
      
      // Update active ticket
      setActiveTicket(response.data.ticket);
    } catch (err) {
      console.error('Error updating ticket status:', err);
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800',
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      open: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800',
      closed: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || colors.open;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Support Tickets</h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-red-700">
            <div className="flex items-start">
              <AlertCircle className="mr-3 h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Tickets List */}
            <div className={`w-full ${activeTicket ? 'lg:w-1/3' : ''}`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">My Tickets</h2>
                <Link
                  to="/support"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="-ml-0.5 mr-2 h-4 w-4" />
                  New Ticket
                </Link>
              </div>

              {tickets.length === 0 ? (
                <div className="bg-white shadow rounded-lg p-6 text-center">
                  <Ticket className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Support Tickets</h3>
                  <p className="text-gray-500 mb-4">
                    You don't have any support tickets yet. Create one using our AI assistant or by clicking the New Ticket button.
                  </p>
                  <Link
                    to="/support"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Go to Support Center
                  </Link>
                </div>
              ) : (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <ul className="divide-y divide-gray-200">
                    {tickets.map((ticket) => (
                      <li key={ticket.id}>
                        <button
                          onClick={() => viewTicket(ticket)}
                          className={`w-full text-left px-4 py-4 hover:bg-gray-50 transition-colors ${
                            activeTicket?.id === ticket.id ? 'bg-indigo-50' : ''
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{ticket.subject}</p>
                              <div className="mt-1 flex items-center">
                                <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusBadge(ticket.status)}`}>
                                  {ticket.status.replace('_', ' ')}
                                </span>
                                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${getPriorityBadge(ticket.priority)}`}>
                                  {ticket.priority}
                                </span>
                                <span className="ml-2 text-xs text-gray-500">
                                  {new Date(ticket.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Ticket Details */}
            {activeTicket && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-full lg:w-2/3 bg-white shadow rounded-lg overflow-hidden flex flex-col"
              >
                <div className="px-6 py-5 border-b border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {activeTicket.subject}
                      </h3>
                      <div className="mt-1 flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusBadge(activeTicket.status)}`}>
                          {activeTicket.status.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getPriorityBadge(activeTicket.priority)}`}>
                          {activeTicket.priority}
                        </span>
                        <span className="text-xs text-gray-500">
                          {activeTicket.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateTicketStatus('closed')}
                        disabled={activeTicket.status === 'closed'}
                        className={`text-xs px-3 py-1 rounded border ${
                          activeTicket.status === 'closed'
                            ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                            : 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                        }`}
                      >
                        Close Ticket
                      </button>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-gray-600">
                    Created on {formatDate(activeTicket.created_at)}
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto max-h-[30rem]">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{activeTicket.description}</p>
                  </div>

                  <div className="p-6 space-y-6">
                    <h4 className="font-medium text-gray-900">Comments</h4>
                    
                    {ticketComments.length === 0 ? (
                      <p className="text-sm text-gray-500">No comments yet.</p>
                    ) : (
                      <div className="space-y-4">
                        {ticketComments.map((comment) => (
                          <div key={comment.id} className={`p-4 rounded-lg ${comment.is_staff ? 'bg-blue-50' : 'bg-gray-50'}`}>
                            <div className="flex items-center mb-2">
                              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white ${comment.is_staff ? 'bg-blue-500' : 'bg-gray-500'}`}>
                                {comment.is_staff ? 'S' : 'U'}
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium">
                                  {comment.is_staff ? 'Support Agent' : 'You'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatDate(comment.created_at)}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm">{comment.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-200 bg-white">
                  <div className="flex items-start space-x-3">
                    <div className="flex-1">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        rows={3}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <button
                      onClick={submitComment}
                      disabled={!newComment.trim() || submittingComment}
                      className={`px-4 py-2 rounded-md text-white text-sm font-medium ${
                        !newComment.trim() || submittingComment
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-700'
                      }`}
                    >
                      {submittingComment ? <LoadingSpinner size="sm" /> : 'Send'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
        
        {/* Help Info */}
        {!activeTicket && !loading && !error && (
          <div className="mt-8 bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Support Ticket Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <MessageSquare className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="font-medium text-blue-900">Chat Support</h3>
                </div>
                <p className="text-sm text-blue-800">
                  For immediate assistance, use our AI-powered DebtFlow Assistant or chat with our support team during business hours.
                </p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <Ticket className="h-5 w-5 text-purple-600 mr-2" />
                  <h3 className="font-medium text-purple-900">Ticket Priority</h3>
                </div>
                <p className="text-sm text-purple-800">
                  High priority tickets are addressed within 4 hours, medium within 24 hours, and low within 48 hours during business days.
                </p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <Clock className="h-5 w-5 text-green-600 mr-2" />
                  <h3 className="font-medium text-green-900">Response Time</h3>
                </div>
                <p className="text-sm text-green-800">
                  Our support team operates Monday to Friday, 9am to 5pm ET. All tickets receive an initial response within one business day.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 