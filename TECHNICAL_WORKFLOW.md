# College Dating App: Technical Workflow

## Core Technical Stack

- **Frontend**: React.js (Vite) + Tailwind CSS
- **Authentication**: Clerk
- **Database**: mongodb
- **Storage for photos**: google drive 
- **Swipe Mechanism**: react-tinder-card npm package
- **Backend**: Node.js/Express.js API layer

## User Flow Architecture

### 1. Landing Page (/)
- Hero section with college-themed visuals
- Slider showcasing app features
- Auth triggers using Supabase's prebuilt components:
```jsx
<SignInButton mode="modal" afterSignInUrl="/info" />
<SignUpButton mode="modal" afterSignUpUrl="/info" />
```
- Responsive design with Tailwind CSS grid layouts

### 2. Authentication Flow
- clerk

### 3. Profile Completion (/info)
- Form fields:
  - Required: First Name
  - Optional: Last Name, Phone, Instagram, Photo Upload
- On form submission, the data will be sent to MongoDB, and the user will be redirected to `/people`.


### 4. Matching Interface (/people)
- Tinder-style card stack:
```jsx
<TinderCard 
  onSwipe={(dir) => handleSwipe(dir, currentProfile.id)}
  preventSwipe={['up','down']}
>
  <ProfileCard data={currentProfile} />
</TinderCard>
```
- Swipe logic:
  - Right swipe ➔ Add to likes[]
  - Left swipe ➔ Add to dislikes[]
- Match detection via mongodb RPC:
```sql
CREATE FUNCTION check_match(user_id UUID, target_id UUID) 
RETURNS BOOLEAN AS $$ 
SELECT EXISTS (
  SELECT 1 FROM profiles 
  WHERE id = target_id 
  AND user_id = ANY(likes)
)
$$ LANGUAGE sql;
```

### 5. Matches Page (/matches)
- Grid layout of mutual matches
- Contact details reveal on match:
```javascript
const [showContacts, setShowContacts] = useState(false)

const channel = mongo.channel('matches')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'matches'
  }, handleNewMatch)
```

## Database Schema (Mongodb)
```javascript
{
  id: UUID (PK),
  first_name: TEXT NOT NULL,
  last_name: TEXT NOT NULL,
  phone: TEXT,
  instagram: TEXT,
  email: TEXT NOT NULL UNIQUE,
  photo_url: TEXT NOT NULL,
  likes: UUID[] DEFAULT ARRAY[]::UUID[],
  dislikes: UUID[] DEFAULT ARRAY[]::UUID[],
  matches: UUID[] DEFAULT ARRAY[]::UUID[],
  created_at: TIMESTAMPTZ DEFAULT NOW()
}
```

## Security Considerations
- Row Level Security (RLS) for all profile data
- Supabase webhooks for session revocation
- Rate limiting on swipe endpoints
- Opt-in contact visibility with progressive disclosure

## Performance Optimization
- CDN caching for profile photos
- Debounced swipe API calls
- Virtualized match lists
- Edge functions for match detection

---

*This architecture combines modern development practices with privacy-focused design, using battle-tested services like mongo to accelerate development while maintaining enterprise-grade security.* 