import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Card } from '../ui/Card';

interface GeoItem {
  id: string;
  name: string;
}

export const RegisterForm: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [countries, setCountries] = useState<GeoItem[]>([]);
  const [states, setStates] = useState<GeoItem[]>([]);
  const [cities, setCities] = useState<GeoItem[]>([]);
  
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  // Load countries first
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const { data, error } = await supabase.from('countries').select('id, name');
        if (!error && data) {
          setCountries(data);
          if (data.length > 0) {
            setSelectedCountry(data[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch countries:', err);
      }
    };
    fetchCountries();
  }, []);

  // Load states based on country
  useEffect(() => {
    if (!selectedCountry) return;
    const fetchStates = async () => {
      try {
        const { data, error } = await supabase
          .from('states')
          .select('id, name')
          .eq('country_id', selectedCountry);
        if (!error && data) {
          setStates(data);
          if (data.length > 0) {
            setSelectedState(data[0].id);
          } else {
            setStates([]);
            setSelectedState('');
          }
        }
      } catch (err) {
        console.error('Failed to fetch states:', err);
      }
    };
    fetchStates();
  }, [selectedCountry]);

  // Load cities based on state
  useEffect(() => {
    if (!selectedState) {
      setCities([]);
      setSelectedCity('');
      return;
    }
    const fetchCities = async () => {
      try {
        const { data, error } = await supabase
          .from('cities')
          .select('id, name')
          .eq('state_id', selectedState);
        if (!error && data) {
          setCities(data);
          if (data.length > 0) {
            setSelectedCity(data[0].id);
          } else {
            setCities([]);
            setSelectedCity('');
          }
        }
      } catch (err) {
        console.error('Failed to fetch cities:', err);
      }
    };
    fetchCities();
  }, [selectedState]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !username || !email || !password || !selectedCity) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Sign up user via Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'https://civicplus-app.web.app',
          data: {
            full_name: fullName,
            username: username.toLowerCase().trim(),
          }
        }
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      const user = data.user;
      if (user) {
        // 2. Wait a brief moment for the handle_new_user trigger to execute
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // 3. Update the newly created profile with geography details
        const { error: profileUpdateError } = await supabase
          .from('profiles')
          .update({
            country_id: selectedCountry,
            state_id: selectedState,
            city_id: selectedCity,
          })
          .eq('id', user.id);

        if (profileUpdateError) {
          console.error('Failed to update geographic profile details:', profileUpdateError);
        }

        setSuccess(true);
        setTimeout(() => {
          navigate('/home');
        }, 2000);
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={{ width: '100%', maxWidth: '450px', margin: '0 auto' }}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
          <h2 style={{ fontSize: '1.75rem' }}>Create Account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Join the civic network and help improve your city.
          </p>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: 'var(--danger-light)',
              color: 'var(--danger)',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              border: '1px solid hsla(0, 84%, 55%, 0.1)',
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              backgroundColor: 'var(--success-light)',
              color: 'var(--success)',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              border: '1px solid hsla(152, 69%, 40%, 0.1)',
              textAlign: 'center',
            }}
          >
            Registration successful! Redirecting to feed...
          </div>
        )}

        <Input
          label="Full Name"
          type="text"
          placeholder="John Doe"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          disabled={loading || success}
          required
        />

        <Input
          label="Username"
          type="text"
          placeholder="johndoe"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading || success}
          required
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading || success}
          required
        />

        <Input
          label="Password"
          type="password"
          placeholder="Minimum 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading || success}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Country"
            options={countries.map((c) => ({ value: c.id, label: c.name }))}
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            disabled={loading || success}
            required
          />

          <Select
            label="State"
            options={states.map((s) => ({ value: s.id, label: s.name }))}
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            disabled={loading || success || states.length === 0}
            required
          />
        </div>

        <Select
          label="City / Municipality"
          options={cities.map((c) => ({ value: c.id, label: c.name }))}
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          disabled={loading || success || cities.length === 0}
          required
          helperText="Your feed will default to issues reported in this city."
        />

        <Button type="submit" loading={loading} disabled={success} style={{ width: '100%', marginTop: '0.5rem' }}>
          Create Account
        </Button>

        <div style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.875rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Already have an account? </span>
          <Link to="/login" style={{ fontWeight: 500 }}>
            Sign In
          </Link>
        </div>
      </form>
    </Card>
  );
};
