import { useState, useEffect, useMemo } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, FileDown, Search, RefreshCw, Shield } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import LoadingSpinner from '@/components/ui/loading-spinner';

// Define event type colors
const eventTypeColors = {
  login_success: 'bg-green-500',
  login_failed: 'bg-red-500',
  password_changed: 'bg-blue-500',
  signup_success: 'bg-emerald-500',
  signup_failed: 'bg-orange-500',
  password_reset_requested: 'bg-violet-500',
  password_reset_completed: 'bg-indigo-500',
  logout: 'bg-slate-500',
  suspicious_activity: 'bg-rose-600',
  rate_limit_exceeded: 'bg-amber-500',
  verification_requested: 'bg-cyan-500',
  default: 'bg-gray-500',
};

// Interface for security event
interface SecurityEvent {
  id: string;
  user_id: string | null;
  event_type: string;
  ip_address: string | null;
  user_agent: string | null;
  email: string | null;
  details: any; // Using any since this will be a JSON object with varying structure
  created_at: string;
  request_id: string;
}

const SecurityEvents = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('');
  const [timeFilter, setTimeFilter] = useState<string>('7d');
  const [eventTypes, setEventTypes] = useState<string[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  const pageSize = 20;

  // Fetch security events
  const fetchEvents = async (page = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      // Calculate date range based on time filter
      let fromDate: Date | null = null;
      const now = new Date();
      
      switch (timeFilter) {
        case '24h':
          fromDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          fromDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          fromDate = null;
      }

      // Start building the query
      let query = supabase
        .from('security_events')
        .select('*', { count: 'exact' });

      // Apply filters
      if (fromDate) {
        query = query.gte('created_at', fromDate.toISOString());
      }
      
      if (eventTypeFilter) {
        query = query.eq('event_type', eventTypeFilter);
      }
      
      if (searchTerm) {
        query = query.or(`email.ilike.%${searchTerm}%,ip_address.ilike.%${searchTerm}%,details.ilike.%${searchTerm}%`);
      }
      
      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      // Execute the query
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);
      
      if (error) throw error;
      
      setEvents(data || []);
      setTotalPages(Math.ceil((count || 0) / pageSize));
      
      // Fetch distinct event types for the filter
      if (page === 1 && !eventTypeFilter) {
        const { data: typeData } = await supabase
          .from('security_events')
          .select('event_type')
          .order('event_type')
          .is('event_type', 'not.null');
        
        if (typeData) {
          const uniqueTypes = Array.from(
            new Set(typeData.map(item => item.event_type))
          );
          setEventTypes(uniqueTypes);
        }
      }
    } catch (err: any) {
      console.error('Error fetching security events:', err);
      setError(err.message || 'Failed to load security events');
      toast({
        variant: 'destructive',
        title: 'Error loading security events',
        description: err.message || 'Failed to load security events',
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchEvents(currentPage);
  }, [currentPage, timeFilter, eventTypeFilter, searchTerm]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    fetchEvents(1);
  };

  // Handle export
  const handleExport = async () => {
    setLoading(true);
    
    try {
      // Start building the query for export (no pagination)
      let query = supabase
        .from('security_events')
        .select('*');

      // Apply the same filters as the view
      if (timeFilter !== 'all') {
        const now = new Date();
        let fromDate: Date;
        
        switch (timeFilter) {
          case '24h':
            fromDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
          case '7d':
            fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case '30d':
            fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case '90d':
            fromDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
          default:
            fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        }
        
        query = query.gte('created_at', fromDate.toISOString());
      }
      
      if (eventTypeFilter) {
        query = query.eq('event_type', eventTypeFilter);
      }
      
      if (searchTerm) {
        query = query.or(`email.ilike.%${searchTerm}%,ip_address.ilike.%${searchTerm}%,details.ilike.%${searchTerm}%`);
      }
      
      // Execute the query
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Convert to CSV
      if (data && data.length > 0) {
        const headers = Object.keys(data[0]).filter(key => key !== 'details');
        
        // Create CSV content
        let csvContent = headers.join(',') + ',details_json\n';
        
        data.forEach(row => {
          let line = headers.map(key => {
            // Handle special formatting for created_at
            if (key === 'created_at') {
              return `"${new Date(row[key]).toISOString()}"`;
            }
            
            // Format other fields, escaping quotes
            const value = row[key] === null ? '' : String(row[key]).replace(/"/g, '""');
            return `"${value}"`;
          }).join(',');
          
          // Add details as a separate JSON column
          const detailsJson = row.details ? JSON.stringify(row.details).replace(/"/g, '""') : '';
          line += `,"${detailsJson}"`;
          
          csvContent += line + '\n';
        });
        
        // Create and download the file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `security-events-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: 'Export completed',
          description: `${data.length} events exported to CSV`,
        });
      } else {
        toast({
          title: 'No data to export',
          description: 'There are no security events matching your filters',
        });
      }
    } catch (err: any) {
      console.error('Error exporting security events:', err);
      toast({
        variant: 'destructive',
        title: 'Export failed',
        description: err.message || 'Failed to export security events',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchEvents(currentPage);
  };

  // Get event type badge color
  const getEventTypeColor = (eventType: string) => {
    return eventTypeColors[eventType as keyof typeof eventTypeColors] || eventTypeColors.default;
  };

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <AdminPageHeader 
        title="Security Events" 
        description="Monitor login attempts, password changes, and other security-related activities"
        icon={<Shield className="h-8 w-8 text-primary" />}
      />
      
      {/* Filters section */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <Input
            type="text"
            placeholder="Search by email, IP, or details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button type="submit">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </form>
        
        <div className="flex gap-2 items-center">
          <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Event Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Events</SelectItem>
              {eventTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {type.replace(/_/g, ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          <Button variant="outline" onClick={handleExport}>
            <FileDown className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      
      {/* Results section */}
      <Card>
        <CardHeader>
          <CardTitle>Security Event Log</CardTitle>
          <CardDescription>
            {loading ? 'Loading events...' : 
             error ? 'Error loading events' : 
             `Showing ${events.length} of ${totalPages * pageSize} events`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex justify-center items-center py-10">
              <LoadingSpinner size="lg" />
            </div>
          )}
          
          {error && !loading && (
            <div className="flex items-center gap-2 p-4 border rounded-md bg-red-50 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          )}
          
          {!loading && !error && events.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              <p>No security events found.</p>
              <p className="text-sm mt-2">Try changing your search filters.</p>
            </div>
          )}
          
          {!loading && !error && events.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map(event => (
                    <TableRow key={event.id}>
                      <TableCell className="whitespace-nowrap">
                        <span className="block text-sm" title={new Date(event.created_at).toLocaleString()}>
                          {formatRelativeTime(event.created_at)}
                        </span>
                        <span className="block text-xs text-gray-500">
                          {new Date(event.created_at).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getEventTypeColor(event.event_type)} text-white`}>
                          {event.event_type.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{event.email || '-'}</TableCell>
                      <TableCell>{event.ip_address || '-'}</TableCell>
                      <TableCell className="max-w-[200px] truncate hover:whitespace-normal hover:overflow-visible">
                        <div className="text-xs font-mono p-1 bg-gray-100 rounded">
                          {JSON.stringify(event.details || {})}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {totalPages > 1 && (
            <div className="mt-4 flex justify-center">
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityEvents; 