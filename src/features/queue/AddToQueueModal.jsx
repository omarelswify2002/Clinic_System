import { useState } from 'react';
import { Search } from 'lucide-react';
import { Modal, Input, Button } from '../../shared/ui';
import { patientApi, queueApi } from '../../services/api';
import { useTranslation } from '../../shared/i18n';

export default function AddToQueueModal({ isOpen, onClose, onSuccess }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState('normal');
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setSearching(true);
      const results = await patientApi.searchPatients(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return;

    try {
      setLoading(true);
      await queueApi.addToQueue(selectedPatient.id, selectedPatient, notes, priority);
      onSuccess();
      resetForm();
    } catch (error) {
      console.error('Failed to add to queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedPatient(null);
    setNotes('');
    setPriority('normal');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('queue.addToQueue')} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {!selectedPatient ? (
          <>
            <div className="flex gap-2">
              <Input
                placeholder={t('queue.searchByNameOrId')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
                className="flex-1"
              />
              <Button type="button" onClick={handleSearch} loading={searching}>
                <Search size={20} />
              </Button>
            </div>

            {searchResults.length > 0 && (
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg divide-y dark:divide-gray-600 max-h-64 overflow-y-auto">
                {searchResults.map((patient) => (
                  <div
                    key={patient.id}
                    onClick={() => setSelectedPatient(patient)}
                    className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {patient.firstName} {patient.lastName}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      ID: {patient.nationalId} • {patient.phone}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {searchQuery && searchResults.length === 0 && !searching && (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                {t('patients.noPatients')}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {selectedPatient.firstName} {selectedPatient.lastName}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    ID: {selectedPatient.nationalId}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPatient(null)}
                >
                  {t('common.edit')}
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('queue.priority')}
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="normal">{t('queue.normal')}</option>
                <option value="urgent">{t('queue.urgent')}</option>
              </select>
            </div>

            <Input
              label={t('queue.notes')}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('queue.reasonForVisit')}
            />

            <div className="flex gap-3 justify-end pt-4">
              <Button variant="secondary" onClick={handleClose} type="button">
                {t('common.cancel')}
              </Button>
              <Button type="submit" loading={loading}>
                {t('queue.addToQueue')}
              </Button>
            </div>
          </>
        )}
      </form>
    </Modal>
  );
}

