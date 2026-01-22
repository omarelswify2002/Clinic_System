import { useState } from 'react';
import { Modal, Input, Button } from '../../shared/ui';
import { patientApi } from '../../services/api';
import { validateNationalId, validatePhone } from '../../shared/utils';
import { useTranslation } from '../../shared/i18n';

export default function AddPatientModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    nationalId: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'male',
    phone: '',
    email: '',
    address: '',
    bloodType: '',
    allergies: '',
    chronicDiseases: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!validateNationalId(formData.nationalId)) {
      newErrors.nationalId = 'Invalid national ID';
    }
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }
    if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Invalid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    try {
      setLoading(true);
      const patientData = {
        ...formData,
        allergies: formData.allergies ? formData.allergies.split(',').map(a => a.trim()) : [],
        chronicDiseases: formData.chronicDiseases ? formData.chronicDiseases.split(',').map(d => d.trim()) : [],
      };
      
      await patientApi.createPatient(patientData);
      onSuccess();
      resetForm();
    } catch (error) {
      console.error('Failed to create patient:', error);
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nationalId: '',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: 'male',
      phone: '',
      email: '',
      address: '',
      bloodType: '',
      allergies: '',
      chronicDiseases: '',
    });
    setErrors({});
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('patients.addPatient')} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t('patients.nationalId')}
            name="nationalId"
            value={formData.nationalId}
            onChange={handleChange}
            error={errors.nationalId}
            required
          />
          <Input
            label={t('patients.bloodType')}
            name="bloodType"
            value={formData.bloodType}
            onChange={handleChange}
            placeholder="e.g., A+"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t('patients.firstName')}
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            error={errors.firstName}
            required
          />
          <Input
            label={t('patients.lastName')}
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            error={errors.lastName}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t('patients.dateOfBirth')}
            name="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleChange}
            error={errors.dateOfBirth}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('patients.gender')} <span className="text-red-500">*</span>
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="male">{t('patients.male')}</option>
              <option value="female">{t('patients.female')}</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t('patients.phone')}
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            required
          />
          <Input
            label={t('patients.email')}
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <Input
          label={t('patients.address')}
          name="address"
          value={formData.address}
          onChange={handleChange}
        />

        <Input
          label={t('patients.allergies')}
          name="allergies"
          value={formData.allergies}
          onChange={handleChange}
          placeholder="Comma-separated (e.g., Penicillin, Aspirin)"
        />

        <Input
          label={t('patients.chronicDiseases')}
          name="chronicDiseases"
          value={formData.chronicDiseases}
          onChange={handleChange}
          placeholder="Comma-separated (e.g., Diabetes, Hypertension)"
        />

        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {errors.submit}
          </div>
        )}

        <div className="flex gap-3 justify-end pt-4">
          <Button variant="secondary" onClick={onClose} type="button">
            {t('common.cancel')}
          </Button>
          <Button type="submit" loading={loading}>
            {t('patients.addPatient')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

