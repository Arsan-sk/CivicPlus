import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { ArrowLeft, UploadSimple } from '@phosphor-icons/react';

interface CreateDiscussionPageProps {
  onBack?: () => void;
  defaultType?: string;
}

export const CreateDiscussionPage: React.FC<CreateDiscussionPageProps> = ({ onBack, defaultType }) => {
  const { profile } = useAuthStore();
  const navigate = useNavigate();

  const [content, setContent] = useState('');
  const [discussionType, setDiscussionType] = useState(defaultType || 'general');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error('Please write some content for the discussion.');
      return;
    }

    setSubmitting(true);

    let userCityId = profile?.city_id;
    if (!userCityId) {
      try {
        const { data: firstCity } = await supabase.from('cities').select('id').limit(1).single();
        userCityId = firstCity?.id || null;
      } catch (err) {
        console.error(err);
      }
    }

    try {
      let publicImageUrl = '';

      if (image) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `discussions/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('issue-media')
          .upload(filePath, image);

        if (!uploadError) {
          const { data } = supabase.storage.from('issue-media').getPublicUrl(filePath);
          publicImageUrl = data.publicUrl;
        }
      }

      const postImages = publicImageUrl ? [publicImageUrl] : null;

      const { error } = await supabase
        .from('discussions')
        .insert({
          author_id: profile?.id,
          content: content.trim(),
          discussion_type: discussionType,
          images: postImages,
          city_id: userCityId
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Civic discussion posted successfully!');
      navigate('/home');
    } catch (err: any) {
      console.error(err);
      toast.error(`Post failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: '650px', margin: '0 auto', textAlign: 'left' }}>
      <div className="flex align-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="btn btn-ghost btn-sm"
            style={{ borderRadius: '50%', padding: '8px' }}
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div>
          <h2 style={{ fontSize: '1.75rem' }}>Start a Civic Discussion</h2>
          <p style={{ color: 'var(--text-muted)' }}>Share ideas, awareness, or opinions on local city developments.</p>
        </div>
      </div>

      <Card style={{ padding: '2rem' }}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4">
            <Select
              label="Discussion Type / Focus"
              options={[
                { value: 'general', label: 'General Discussion' },
                { value: 'suggestion', label: 'Civic Suggestion' },
                { value: 'opinion', label: 'Public Opinion' },
                { value: 'complaint', label: 'General Complaint' },
                { value: 'awareness', label: 'Community Awareness' },
                { value: 'feedback', label: 'Department Feedback' },
                ...(profile?.role === 'authority'
                  ? [{ value: 'announcement', label: 'Official Announcement (Authorities Only)' }]
                  : [])
              ]}
              value={discussionType}
              onChange={(e) => setDiscussionType(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: '0.25rem' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Trending Hot Topics (Click to add hashtag)</label>
            <div className="flex flex-wrap gap-2">
              {['#NEETPaperLeak', '#EthanolBlending', '#WaterConservation', '#SmartCity', '#RoadSafety', '#TeacherRecruitment'].map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => {
                    if (!content.includes(topic)) {
                      setContent((prev) => (prev ? prev + ' ' + topic : topic));
                    }
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.75rem',
                    backgroundColor: 'var(--bg-offset)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                  className="card-interactive"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">What would you like to discuss?</label>
            <textarea
              className="form-input"
              style={{ minHeight: '140px', resize: 'vertical', padding: '0.75rem' }}
              placeholder="Describe your idea or post..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              maxLength={1000}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              <span>Please keep comments respectful & constructive.</span>
              <span>{1000 - content.length} characters remaining</span>
            </div>
          </div>

          <div>
            <label className="form-label">Attach Photo (Optional)</label>
            <div
              style={{
                border: '2px dashed var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: 'var(--bg-offset)',
              }}
              onClick={() => document.getElementById('discussion-media-upload')?.click()}
            >
              <input
                type="file"
                id="discussion-media-upload"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageChange}
              />
              {imagePreview ? (
                <div style={{ position: 'relative', maxWidth: '250px', margin: '0 auto' }}>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ width: '100%', borderRadius: 'var(--radius-md)', maxHeight: '150px', objectFit: 'cover' }}
                  />
                  <Badge variant="primary" style={{ position: 'absolute', bottom: '5px', right: '5px' }}>
                    Change Photo
                  </Badge>
                </div>
              ) : (
                <div className="flex flex-col align-center gap-1">
                  <UploadSimple size={28} color="var(--primary)" />
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Click to upload file</span>
                </div>
              )}
            </div>
          </div>

          <Button type="submit" loading={submitting} style={{ width: '100%' }}>
            Post Discussion
          </Button>
        </form>
      </Card>
    </div>
  );
};
export default CreateDiscussionPage;
