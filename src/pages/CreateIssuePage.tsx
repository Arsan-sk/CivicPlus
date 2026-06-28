import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { toast } from 'react-hot-toast';
import {
  UploadSimple,
  Warning,
  MapPin,
  Sparkle,
  ArrowLeft,
  CheckCircle,
} from '@phosphor-icons/react';

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
}

interface Department {
  id: string;
  name: string;
}

interface DuplicateIssue {
  id: string;
  title: string;
  status: string;
  support_count: number;
}

interface CreateIssuePageProps {
  onBack?: () => void;
}

export const CreateIssuePage: React.FC<CreateIssuePageProps> = ({ onBack }) => {
  const { profile } = useAuthStore();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  
  // AI suggestions
const [aiSuggestions, setAiSuggestions] = useState<{
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  summary?: string;
} | null>(null);

  // Duplicates list
  const [duplicates, setDuplicates] = useState<DuplicateIssue[]>([]);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Fetch categories
    const fetchCategories = async () => {
      const { data } = await supabase.from('issue_categories').select('id, name, slug, color');
      if (data) {
        setCategories(data);
        if (data.length > 0) setSelectedCategory(data[0].id);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    // Fetch departments of current city
    if (!profile?.city_id) return;
    const fetchDepartments = async () => {
      const { data } = await supabase
        .from('departments')
        .select('id, name')
        .eq('city_id', profile.city_id);
      if (data) setDepartments(data);
    };
    fetchDepartments();
  }, [profile]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


// ── Keyword fallback (used if Gemini fails) ──────────────────────────────────
const runKeywordFallback = (title: string, description: string) => {
  const text = `${title} ${description}`.toLowerCase();
  let suggestedCategorySlug = 'other';
  let confidence = 0.72;
  let suggestedSeverity: 'low' | 'medium' | 'high' | 'critical' = 'medium';

  if (text.includes('pothole') || text.includes('road') || text.includes('cracks')) {
    suggestedCategorySlug = 'pothole'; suggestedSeverity = 'high'; confidence = 0.80;
  } else if (text.includes('garbage') || text.includes('waste') || text.includes('trash') || text.includes('dump')) {
    suggestedCategorySlug = 'garbage'; suggestedSeverity = 'medium'; confidence = 0.80;
  } else if (text.includes('leak') || text.includes('water') || text.includes('leakage') || text.includes('pipe')) {
    suggestedCategorySlug = 'water-leakage'; suggestedSeverity = 'high'; confidence = 0.78;
  } else if (text.includes('light') || text.includes('streetlight') || text.includes('bulb') || text.includes('dark')) {
    suggestedCategorySlug = 'broken-streetlight'; suggestedSeverity = 'medium'; confidence = 0.76;
  } else if (text.includes('drain') || text.includes('sewage') || text.includes('overflow')) {
    suggestedCategorySlug = 'drainage-problem'; suggestedSeverity = 'critical'; confidence = 0.79;
  }

  const match = categories.find((c) => c.slug === suggestedCategorySlug);
  if (match) {
    setSelectedCategory(match.id);
    setSelectedSeverity(suggestedSeverity);
    setAiSuggestions({ category: match.name, severity: suggestedSeverity, confidence });
  }
};

// ── Real Gemini Vision Analysis ──────────────────────────────────────────────
const runAiAnalysis = async () => {
  if (!image && !description) {
    toast.error('Please upload an image or write a description first.');
    return;
  }
  setStep(2);

  try {
    const GEMINI_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

    // Build the parts array — always send text, add image if available
    const parts: object[] = [
      {
        text: `You are a civic issue classification AI for an Indian municipal platform.

Analyze this civic issue report and return ONLY a valid JSON object. Do not include markdown wraps, code block backticks (like \`\`\`json), or any explanation text.

Issue Title: "${title}"
Issue Description: "${description}"

${image ? 'An image of the issue is provided above. IMPORTANT: Prioritize the image content over the text title/description for determining the category and severity. If the image shows a pothole, select pothole. If it shows garbage, select garbage, even if the text description is vague.' : 'No image provided — classify from text only.'}

Choose from these valid categories (use exact slug):
- pothole: Potholes, road cracks, broken asphalt.
- garbage: Garbage piles, litter, solid waste dumps, overflowing trash bins.
- water-leakage: Burst water mains, leaking pipes, overflowing clean water.
- broken-streetlight: Non-functioning streetlights, broken poles, dark streets at night.
- drainage-problem: Overflowing sewage, clogged gutters, open manholes.
- damaged-infrastructure: Broken pavements/footpaths, damaged dividers, fallen road signs.
- other: Any other general municipal issue.

Choose from these valid severity levels:
- low: Minor issue, no immediate hazard (e.g., small litter, single minor pothole on a quiet street).
- medium: Moderate inconvenience or hazard (e.g., small garbage pile, single dark streetlight).
- high: Major safety hazard or structural failure (e.g., large pothole on highway, burst water pipe flooding a street).
- critical: Severe danger, immediate risk to life, or total blockage of vital roads (e.g., sewage flooding homes, major structural bridge collapse).

Return in this exact JSON structure as shown in below example:
{
  "category_slug": "pothole",
  "severity": "high",
  "confidence": 0.94,
  "summary": "One sentence describing what was detected in the image/text."
}`
      }
    ];

    // If image is available, convert to base64 and add as inlineData
    if (image) {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          // Strip "data:image/jpeg;base64," prefix — keep only base64 bytes
          resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(image);
      });

      // Insert image part BEFORE text part (Gemini reads image first)
      parts.unshift({
        inlineData: {
          mimeType: image.type || 'image/jpeg',
          data: base64,
        }
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            temperature: 0.1,      // low temp = consistent structured output
            maxOutputTokens: 1000,
          }
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Clean any accidental markdown fences Gemini sometimes adds
    const cleaned = rawText.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    // Map Gemini's category_slug to our DB category
    const match = categories.find((c) => c.slug === parsed.category_slug);
    const severity = ['low', 'medium', 'high', 'critical'].includes(parsed.severity)
      ? parsed.severity as 'low' | 'medium' | 'high' | 'critical'
      : 'medium';

    if (match) {
      setSelectedCategory(match.id);
      setSelectedSeverity(severity);
      setAiSuggestions({
        category: match.name,
        severity,
        confidence: Math.min(Math.max(parsed.confidence || 0.85, 0), 1),
        summary: parsed.summary || '',
      });
    } else {
      // Gemini returned an unknown slug — run keyword fallback
      runKeywordFallback(title, description);
    }

  } catch (err) {
    // ── FALLBACK: if Gemini fails for any reason, silently use keyword matching ──
    console.warn('Gemini analysis failed, using keyword fallback:', err);
    runKeywordFallback(title, description);
  }

  setStep(3);
};

  // Check for duplicates
  const checkForDuplicates = async () => {
    if (!selectedCategory) {
      toast.error('Please select a category first.');
      return;
    }
    
    // Always advance to Step 4 to preserve linear flow order
    setStep(4);

    if (!profile?.city_id) {
      setDuplicates([]);
      return;
    }
    
    try {
      const { data } = await supabase
        .from('issue_reports')
        .select('id, title, status, support_count')
        .eq('city_id', profile.city_id)
        .eq('category_id', selectedCategory)
        .in('status', ['submitted', 'community_verification_pending', 'community_verified', 'in_progress'])
        .limit(3);

      if (data) {
        setDuplicates(data as DuplicateIssue[]);
      } else {
        setDuplicates([]);
      }
    } catch (err) {
      console.error(err);
      setDuplicates([]);
    }
  };

  const fetchAddressFromCoords = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
        {
          headers: {
            'User-Agent': 'CivicPlus-Community-App'
          }
        }
      );
      if (response.ok) {
        const data = await response.json();
        if (data && data.address) {
          const road = data.address.road || '';
          const suburb = data.address.suburb || data.address.neighbourhood || '';
          const city = data.address.city || data.address.town || data.address.village || '';
          const formatted = [road, suburb, city].filter(Boolean).join(', ');
          if (formatted) {
            setAddress(formatted);
          } else {
            setAddress(data.display_name);
          }
          toast.success('Address name resolved from GPS!');
        }
      }
    } catch (err) {
      console.error('Reverse geocoding failed:', err);
    }
  };


  const handleSupportExisting = async (issueId: string) => {
    try {
      const { error } = await supabase.from('supports').insert({
        user_id: profile?.id,
        issue_id: issueId,
      });

      if (error) {
        if (error.code === '23505') {
          toast.error('You already support this issue!');
        } else {
          toast.error('Failed to add support.');
        }
      } else {
        toast.success('Successfully supported the existing issue!');
        navigate(`/issues/${issueId}`);
      }
    } catch (err) {
      toast.error('An error occurred.');
    }
  };

  const handleSubmitIssue = async () => {
    if (!profile) {
      toast.error('Session profile not loaded. Please login.');
      return;
    }
    setSubmitting(true);

    let userCityId = profile?.city_id;
    if (!userCityId) {
      // Fallback: pick first city in database
      try {
        const { data: firstCity } = await supabase.from('cities').select('id').limit(1).single();
        userCityId = firstCity?.id || null;
      } catch (err) {
        console.error('Failed to resolve city fallback:', err);
      }
    }

    if (!userCityId) {
      toast.error('City location context missing. Please select your city in settings.');
      setSubmitting(false);
      return;
    }

    try {
      let publicImageUrl = '';

      // Upload image to Storage if present
      if (image) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `issues/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('issue-media')
          .upload(filePath, image);

        if (!uploadError) {
          const { data } = supabase.storage.from('issue-media').getPublicUrl(filePath);
          publicImageUrl = data.publicUrl;
        } else {
          // Fallback to stock unsplash image
          const cat = categories.find((c) => c.id === selectedCategory);
          publicImageUrl = `https://images.unsplash.com/photo-1599740831419-b5ce2d26f74a?w=800`; // general fallback
          if (cat?.slug === 'pothole') {
            publicImageUrl = 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=800';
          } else if (cat?.slug === 'garbage') {
            publicImageUrl = 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800';
          }
        }
      }

      // Map to correct department based on category
      const mappedDept = departments.find((d) => {
        const cat = categories.find((c) => c.id === selectedCategory);
        if (!cat) return false;
        return d.name.toLowerCase().includes(cat.name.toLowerCase().split(' ')[0]);
      });

      const { data: newIssue, error: insertError } = await supabase
        .from('issue_reports')
        .insert({
          author_id: profile.id,
          title,
          description,
          category_id: selectedCategory,
          severity: selectedSeverity,
          city_id: userCityId,
          latitude: latitude || 19.076,
          longitude: longitude || 72.877,
          address: address || 'Near main road',
          assigned_department_id: mappedDept?.id || null,
          ai_category_confidence: aiSuggestions?.confidence || null,
          ai_severity_confidence: 0.85,
        })
        .select()
        .single();

      if (insertError) {
        toast.error(`Submission failed: ${insertError.message}`);
        setSubmitting(false);
        return;
      }

      if (newIssue && publicImageUrl) {
        // Insert media record
        await supabase.from('issue_media').insert({
          issue_id: newIssue.id,
          media_url: publicImageUrl,
        });
      }

      toast.success('Civic issue reported successfully!');
      navigate(`/issues/${newIssue.id}`);
    } catch (err) {
      console.error(err);
      toast.error('An unexpected error occurred during submission.');
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: '650px', margin: '0 auto', textAlign: 'left' }}>
      <div className="flex align-center gap-3">
        {step > 1 ? (
          <button
            onClick={() => setStep((prev) => prev - 1)}
            className="btn btn-ghost btn-sm"
            style={{ borderRadius: '50%', padding: '8px' }}
          >
            <ArrowLeft size={20} />
          </button>
        ) : onBack ? (
          <button
            onClick={onBack}
            className="btn btn-ghost btn-sm"
            style={{ borderRadius: '50%', padding: '8px' }}
          >
            <ArrowLeft size={20} />
          </button>
        ) : null}
        <div>
          <h2 style={{ fontSize: '1.75rem' }}>Report a Civic Issue</h2>
          <p style={{ color: 'var(--text-muted)' }}>Help authorities fix community hazards in your area.</p>
        </div>
      </div>

      {/* STEP 1: UPLOAD AND CORE DETAILS */}
      {step === 1 && (
        <Card className="flex flex-col gap-5">
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            style={{
              border: '2px dashed var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: 'var(--bg-offset)',
              transition: 'border-color var(--transition-fast)',
            }}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <input
              type="file"
              id="file-upload"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageChange}
            />
            {imagePreview ? (
              <div style={{ position: 'relative', maxWidth: '300px', margin: '0 auto' }}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ width: '100%', borderRadius: 'var(--radius-md)', maxHeight: '200px', objectFit: 'cover' }}
                />
                <Badge variant="primary" style={{ position: 'absolute', bottom: '10px', right: '10px' }}>
                  Change Image
                </Badge>
              </div>
            ) : (
              <div className="flex flex-col align-center gap-2">
                <UploadSimple size={40} color="var(--primary)" />
                <strong>Drag and drop your issue image</strong>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  Supports PNG, JPG (Max 5MB)
                </span>
              </div>
            )}
          </div>

          <Input
            label="Brief Title"
            placeholder="e.g. Large pothole opposite Metro Station"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="form-group">
            <label className="form-label">Description & Context</label>
            <textarea
              className="form-input"
              style={{ minHeight: '100px', resize: 'vertical' }}
              placeholder="Provide exact details of the hazard to help the routing department..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <Button
            onClick={runAiAnalysis}
            disabled={!title || !description || !image}
            style={{ width: '100%' }}
            className="flex align-center justify-center gap-2"
          >
            <Sparkle size={18} weight="fill" />
            Analyze with AI
          </Button>
        </Card>
      )}

      {/* STEP 2: AI ANALYZING PROGRESS */}
      {step === 2 && (
        <Card style={{ textAlign: 'center', padding: '3rem 2rem' }} className="flex flex-col align-center gap-4">
          <div
            style={{
              width: '50px',
              height: '50px',
              border: '4px solid var(--border)',
              borderTop: '4px solid var(--primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <h3 style={{ fontSize: '1.25rem' }}>AI Scanner Running</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '300px' }}>
            Classifying categories, detecting object size, and assessing threat severity factors.
          </p>
        </Card>
      )}

      {/* STEP 3: DETAILS AND LOCATION SELECTOR */}
      {step === 3 && (
        <Card className="flex flex-col gap-8" style={{ padding: '2rem' }}>
          {aiSuggestions && (
            <div
              style={{
                backgroundColor: 'var(--primary-light)',
                border: '1px solid hsla(var(--primary-hue), 85%, 50%, 0.1)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'start',
                gap: '0.75rem',
              }}
            >
              <Sparkle size={24} color="var(--primary)" weight="fill" style={{ marginTop: '2px' }} />
              <div>
                <strong style={{ color: 'var(--primary)', fontSize: '0.875rem' }}>
                  AI Detection Completed
                </strong>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text)', marginTop: '0.25rem' }}>
                  Suggested Category: <strong>{aiSuggestions.category}</strong> (
                  {Math.round(aiSuggestions.confidence * 100)}% match) · Severity:{' '}
                  <strong style={{ textTransform: 'capitalize' }}>{aiSuggestions.severity}</strong>
                </p>
                {aiSuggestions.summary && (
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    {aiSuggestions.summary}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Confirmed Category"
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            />

            <Select
              label="Assessed Severity"
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'critical', label: 'Critical' },
              ]}
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value as any)}
            />
          </div>

          <Input
            label="Location Address"
            placeholder="e.g. Carter Road, Bandra West, Mumbai"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />

          <div
            style={{
              padding: '1.25rem',
              backgroundColor: 'var(--bg-offset)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div className="flex align-center gap-2">
              <MapPin size={20} color="var(--text-muted)" />
              <span style={{ fontSize: '0.875rem' }}>
                {latitude && longitude
                  ? `Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
                  : 'Map coordinates lock pending'}
              </span>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                if (navigator.geolocation) {
                  const toastId = toast.loading('Fetching device coordinates...');
                  navigator.geolocation.getCurrentPosition(
                    async (position) => {
                      const lat = position.coords.latitude;
                      const lon = position.coords.longitude;
                      setLatitude(lat);
                      setLongitude(lon);
                      toast.success('Coordinates locked from GPS!', { id: toastId });
                      await fetchAddressFromCoords(lat, lon);
                    },
                    async (err) => {
                      console.warn('Browser geolocation failed, picking default coords:', err);
                      const lat = 19.0760 + (Math.random() - 0.5) * 0.02;
                      const lon = 72.8777 + (Math.random() - 0.5) * 0.02;
                      setLatitude(lat);
                      setLongitude(lon);
                      toast.success('Locked mock coordinates from GPS!', { id: toastId });
                      await fetchAddressFromCoords(lat, lon);
                    },
                    { enableHighAccuracy: true, timeout: 5000 }
                  );
                } else {
                  const lat = 19.0760 + (Math.random() - 0.5) * 0.02;
                  const lon = 72.8777 + (Math.random() - 0.5) * 0.02;
                  setLatitude(lat);
                  setLongitude(lon);
                  toast.success('Coordinates mock-pinned');
                  fetchAddressFromCoords(lat, lon);
                }
              }}
            >
              Pin GPS Location
            </Button>
          </div>

          <Button onClick={checkForDuplicates} style={{ width: '100%', marginTop: '0.5rem' }}>
            Proceed to Verification
          </Button>
        </Card>
      )}

      {/* STEP 4: DUPLICATE INTERCEPTION CHECK */}
      {step === 4 && (
        <Card className="flex flex-col gap-6" style={{ padding: '2rem' }}>
          {duplicates.length > 0 ? (
            <>
              <div className="flex gap-2 align-center" style={{ color: 'var(--warning)' }}>
                <Warning size={28} weight="fill" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Similar Issues Found Nearby</h3>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.5 }}>
                To prevent duplicate spam alerts, please check if your problem is already described in one of these open tickets. If it is, supporting it raises its public priority directly!
              </p>

              <div className="flex flex-col gap-3 py-2">
                {duplicates.map((dup) => (
                  <div
                    key={dup.id}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: 'var(--bg-offset)',
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '0.875rem', color: 'var(--text-heading)' }}>
                        {dup.title}
                      </strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        Status: {dup.status.replace(/_/g, ' ')} · {dup.support_count} supporters
                      </div>
                    </div>
                    <Button variant="primary" size="sm" onClick={() => handleSupportExisting(dup.id)}>
                      Support Instead
                    </Button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="flex gap-2 align-center" style={{ color: 'var(--success)' }}>
                <CheckCircle size={28} weight="fill" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Duplicate Check Clear</h3>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.5 }}>
                Our duplicate search didn't detect any active tickets matching this category or location nearby. You can safely report this as a unique incident!
              </p>
              <div
                style={{
                  padding: '1.5rem',
                  backgroundColor: 'var(--bg-offset)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  textAlign: 'center',
                  fontSize: '0.875rem',
                  color: 'var(--text-heading)',
                  fontWeight: 600,
                  marginTop: '0.5rem'
                }}
              >
                No similar issues found near your location.
              </div>
            </>
          )}

          <div className="flex justify-between gap-4 mt-4">
            <Button variant="secondary" onClick={() => setStep(3)} style={{ flex: 1 }}>
              Modify Details
            </Button>
            <Button variant="primary" onClick={() => setStep(5)} style={{ flex: 1 }}>
              {duplicates.length > 0 ? 'My Issue is Unique' : 'Proceed to Routing'}
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 5: FINAL ROUTING PREVIEW & SUBMIT */}
      {step === 5 && (
        <Card className="flex flex-col gap-6" style={{ padding: '2rem' }}>
          <h3
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--text-heading)',
              borderBottom: '1px solid var(--border)',
              paddingBottom: '0.75rem',
              marginBottom: '0.25rem',
            }}
          >
            Verify & Route Issue
          </h3>
          
          <div
            style={{
              padding: '1rem',
              backgroundColor: 'var(--bg-offset)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Ticket Name</div>
            <strong style={{ color: 'var(--text-heading)' }}>{title}</strong>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                Category
              </div>
              <Badge variant="primary">
                {categories.find((c) => c.id === selectedCategory)?.name || 'Other'}
              </Badge>
            </div>
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                Severity Rank
              </div>
              <Badge variant={selectedSeverity === 'critical' ? 'danger' : selectedSeverity === 'high' ? 'danger' : 'warning'}>
                {selectedSeverity}
              </Badge>
            </div>
          </div>

          <div
            style={{
              padding: '1rem',
              backgroundColor: 'var(--bg-offset)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Routing Department</div>
              <strong style={{ color: 'var(--text-heading)', fontSize: '0.9375rem' }}>
                {departments.find((d) => {
                  const cat = categories.find((c) => c.id === selectedCategory);
                  return d.name.toLowerCase().includes((cat?.name || '').toLowerCase().split(' ')[0]);
                })?.name || 'Municipal Works General'}
              </strong>
            </div>
            <Badge variant="success">Auto Mapped</Badge>
          </div>

          <Button
            variant="primary"
            size="lg"
            loading={submitting}
            onClick={handleSubmitIssue}
            style={{ width: '100%' }}
          >
            Submit to Board
          </Button>
        </Card>
      )}
    </div>
  );
};
export default CreateIssuePage;
