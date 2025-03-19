import React, { useState, useEffect } from 'react';
import { useNavigate } from '@/empty-module-browser';
import { 
  Shield, 
  Search, 
  Download, 
  Loader2, 
  AlertTriangle, 
  X, 
  RefreshCw,
  Calendar,
  Filter,
  ChevronDown
} from 'lucide-react';
import { supabase } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { IS_DEV } from '@/utils/environment';

// Types
interface SecurityEvent {
  id: string;
  created_at: string;
  user_id: string | null;
  email: string | null;
  event_type: string;
  ip_address: string | null;
  user_agent: string | null;
  details: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

const SecurityEvents: React.FC = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('7d');
  const [pagination, setPagination] = useState({ page: 0, pageSize: 20, totalCount: 0 });
  const navigate = useNavigate();

  // Event types for filtering
  const eventTypes = [
    'login_success',
    'login_failed',
    'logout',
    'password_reset',
    'account_locked',
    'suspicious_activity',
    'unauthorized_access',
    'rate_limit_exceeded',
    'admin_access',
    'permission_change',
  ];

  const severityColors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  };

  // Function to load security events
  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // For demo/development purposes
      if (IS_DEV) {
        // Generate mock data for development
        const mockEvents = generateMockEvents(50);
        setEvents(mockEvents);
        setPagination({ ...pagination, totalCount: mockEvents.length });
        setLoading(false);
        return;
      }
      
      // Calculate date range based on timeRange
      let fromDate = null;
      const now = new Date();
      
      if (timeRange === '24h') {
        fromDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      } else if (timeRange === '7d') {
        fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (timeRange === '30d') {
        fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
      
      // Build query
      let query = supabase
        .from('security_events')
        .select('*', { count: 'exact' });
      
      // Apply date filter if set
      if (fromDate) {
        query = query.gte('created_at', fromDate.toISOString());
      }
      
      // Apply event type filter if set
      if (filterType) {
        query = query.eq('event_type', filterType);
      }
      
      // Apply search term if set
      if (searchTerm) {
        query = query.or(`email.ilike.%${searchTerm}%,user_id.eq.${searchTerm},ip_address.ilike.%${searchTerm}%`);
      }
      
      // Apply pagination
      const { from, to } = getPaginationRange();
      query = query.range(from, to).order('created_at', { ascending: false });
      
      // Execute query
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      setEvents(data as SecurityEvent[]);
      setPagination({ ...pagination, totalCount: count || 0 });
    } catch (err) {
      console.error('Error loading security events:', err);
      setError('Failed to load security events. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate pagination range
  const getPaginationRange = () => {
    const from = pagination.page * pagination.pageSize;
    const to = from + pagination.pageSize - 1;
    return { from, to };
  };

  // Generate mock data for development
  const generateMockEvents = (count: number): SecurityEvent[] => {
    const mockEvents: SecurityEvent[] = [];
    const eventTypes = [
      'login_success', 'login_failed', 'logout', 'password_reset',
      'account_locked', 'suspicious_activity', 'unauthorized_access',
      'rate_limit_exceeded', 'admin_access', 'permission_change'
    ];
    const severities: Array<'low' | 'medium' | 'high' | 'critical'> = ['low', 'medium', 'high', 'critical'];
    const users = [
      { id: 'user1', email: 'john.doe@example.com' },
      { id: 'user2', email: 'jane.smith@example.com' },
      { id: 'user3', email: 'admin@example.com' },
      { id: null, email: 'unknown@example.com' },
      { id: 'user5', email: null }
    ];
    
    for (let i = 0; i < count; i++) {
      const date = new Date();
      date.setHours(date.getHours() - Math.floor(Math.random() * 168)); // Up to 7 days ago
      
      const user = users[Math.floor(Math.random() * users.length)];
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const severity = severities[Math.floor(Math.random() * severities.length)];
      
      // Assign appropriate severity based on event type
      let eventSeverity = severity;
      if (eventType === 'login_success' || eventType === 'logout') {
        eventSeverity = 'low';
      } else if (eventType === 'login_failed' || eventType === 'password_reset') {
        eventSeverity = 'medium';
      } else if (eventType === 'suspicious_activity' || eventType === 'unauthorized_access') {
        eventSeverity = 'high';
      }
      
      mockEvents.push({
        id: `event-${i}`,
        created_at: date.toISOString(),
        user_id: user.id,
        email: user.email,
        event_type: eventType,
        ip_address: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        details: {
          message: `Details for ${eventType} event`,
          location: 'New York, USA',
          browser: 'Chrome',
          os: 'Windows 10'
        },
        severity: eventSeverity
      });
    }
    
    return mockEvents.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  };

  // Export events to CSV
  const exportToCSV = () => {
    if (!events.length) return;
    
    const headers = ['Timestamp', 'User ID', 'Email', 'Event Type', 'IP Address', 'User Agent', 'Severity', 'Details'];
    const rows = events.map(event => [
      new Date(event.created_at).toLocaleString(),
      event.user_id || 'N/A',
      event.email || 'N/A',
      event.event_type,
      event.ip_address || 'N/A',
      event.user_agent || 'N/A',
      event.severity,
      JSON.stringify(event.details)
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `security-events-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format date to readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Set severity based on event type
  const getSeverityForEvent = (event: SecurityEvent) => {
    return event.severity || 'low';
  };

  // Format event type for display
  const formatEventType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Load events on component mount and when filters change
  useEffect(() => {
    loadEvents();
  }, [timeRange, filterType, pagination.page, pagination.pageSize]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadEvents();
  };

  // Handle pagination
  const handleNextPage = () => {
    if ((pagination.page + 1) * pagination.pageSize < pagination.totalCount) {
      setPagination({ ...pagination, page: pagination.page + 1 });
    }
  };

  const handlePrevPage = () => {
    if (pagination.page > 0) {
      setPagination({ ...pagination, page: pagination.page - 1 });
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            Security Events
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Monitor security-related activities across the application
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadEvents()}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Refresh
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={exportToCSV}
            disabled={loading || events.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Filters</CardTitle>
          <CardDescription>Filter security events by various criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Search by email, user ID, or IP..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="sm">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </form>
            </div>

            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Event Type
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Filter by Event Type</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => setFilterType(null)}>
                      All Events
                    </DropdownMenuItem>
                    {eventTypes.map((type) => (
                      <DropdownMenuItem key={type} onClick={() => setFilterType(type)}>
                        {formatEventType(type)}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Time Range
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Filter by Time</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => setTimeRange('24h')}>
                      Last 24 Hours
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTimeRange('7d')}>
                      Last 7 Days
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTimeRange('30d')}>
                      Last 30 Days
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTimeRange('all')}>
                      All Time
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              {(filterType || searchTerm || timeRange !== '7d') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilterType(null);
                    setSearchTerm('');
                    setTimeRange('7d');
                    setPagination({ ...pagination, page: 0 });
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Events table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      <span className="mt-2 block text-sm text-gray-500">Loading events...</span>
                    </TableCell>
                  </TableRow>
                ) : events.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Shield className="h-8 w-8 text-gray-400" />
                        <span className="mt-2 text-gray-500">No security events found</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(event.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          {event.email && <span className="font-medium">{event.email}</span>}
                          {event.user_id && <span className="text-xs text-gray-500">{event.user_id}</span>}
                          {!event.email && !event.user_id && <span className="text-gray-500">Anonymous</span>}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatEventType(event.event_type)}
                      </TableCell>
                      <TableCell>
                        {event.ip_address || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={severityColors[getSeverityForEvent(event)]}
                        >
                          {getSeverityForEvent(event).toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs max-w-xs truncate">
                          {event.details ? (
                            <span title={JSON.stringify(event.details, null, 2)}>
                              {event.details.message || JSON.stringify(event.details).substring(0, 50) + '...'}
                            </span>
                          ) : (
                            'No details'
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {!loading && events.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {events.length} of {pagination.totalCount} events
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={pagination.page === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={(pagination.page + 1) * pagination.pageSize >= pagination.totalCount}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Dev mode indicator */}
      {IS_DEV && (
        <div className="fixed bottom-4 right-4 bg-amber-100 text-amber-800 px-4 py-2 rounded-md text-xs flex items-center">
          <AlertTriangle className="h-4 w-4 mr-2" />
          Development Mode: Showing mock data
        </div>
      )}
    </div>
  );
};

export default SecurityEvents; 