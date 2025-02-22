import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExportData {
  transactions: any[];
  budgets: any[];
  goals: any[];
}

interface DataExportProps {
  data: ExportData;
  onExport: (format: 'csv' | 'json') => Promise<void>;
}

export function DataExport({ data, onExport }: DataExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport(exportFormat);
    } catch (error) {
      console.error('Export failed:', error);
      // Handle error (show notification, etc.)
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6"
    >
      <h3 className="text-xl font-bold text-white mb-4">
        Export Your Data
      </h3>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            variant={exportFormat === 'csv' ? 'default' : 'outline'}
            onClick={() => setExportFormat('csv')}
            className={exportFormat === 'csv' ? 'bg-[#88B04B]' : 'border-white/20'}
            disabled={isExporting}
          >
            <FileSpreadsheet className="w-5 h-5 mr-2" />
            CSV
          </Button>
          <Button
            variant={exportFormat === 'json' ? 'default' : 'outline'}
            onClick={() => setExportFormat('json')}
            className={exportFormat === 'json' ? 'bg-[#88B04B]' : 'border-white/20'}
            disabled={isExporting}
          >
            <FileText className="w-5 h-5 mr-2" />
            JSON
          </Button>
        </div>

        <div className="text-white/60 text-sm">
          <h4 className="font-semibold text-white mb-2">Included Data:</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>Transactions ({data.transactions.length} records)</li>
            <li>Budget History ({data.budgets.length} records)</li>
            <li>Savings Goals ({data.goals.length} records)</li>
          </ul>
        </div>

        <Button
          onClick={handleExport}
          disabled={isExporting}
          className="w-full bg-[#88B04B] hover:bg-[#88B04B]/90"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-5 h-5 mr-2" />
              Export Data
            </>
          )}
        </Button>

        <p className="text-white/60 text-sm">
          Your data will be exported in {exportFormat.toUpperCase()} format.
          This process may take a few moments for large datasets.
        </p>
      </div>
    </motion.div>
  );
}