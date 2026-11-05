// Import React library and state/effect hooks for managing component lifecycle and state
import React, { useState, useEffect } from 'react';

// Export default main App component representing the Gayebi-Pass user interface
export default function App() {
  // State storing the sensitive text typed into the creation form textarea
  const [text, setText] = useState('');
  // State storing the generated secret UUID token received from backend
  const [secretId, setSecretId] = useState('');
  // State storing the secret text retrieved when viewing a one-time link
  const [viewSecret, setViewSecret] = useState(null);
  // State storing error message if secret link is expired, invalid, or already read
  const [error, setError] = useState('');
  // State tracking boolean flag to show 'Copied!' temporary feedback on button click
  const [copied, setCopied] = useState(false);

  // Read current URL path string from browser location API
  const path = window.location.pathname;
  // Determine if current URL indicates viewing a secret link starting with /secret/
  const isViewMode = path.startsWith('/secret/');
  // Extract unique secret ID portion following /secret/ in URL path
  const viewId = isViewMode ? path.split('/secret/')[1] : null;

  // React effect hook running on component mount to auto-fetch secret content if in view mode
  useEffect(() => {
    // Return early if not in viewing mode or if secret ID parameter is missing
    if (!viewId) return;
    // Send HTTP GET request to API endpoint to retrieve secret text by ID
    fetch(`/api/secrets/${viewId}`)
      // Process initial HTTP response received from server
      .then((res) => {
        // If HTTP status is not 200 OK (e.g. 404 Not Found), throw error message
        if (!res.ok) throw new Error('Link expired or already vanished');
        // Parse and return JSON response body payload promise
        return res.json();
      })
      // Save retrieved secret text content into viewSecret state variable
      .then((data) => setViewSecret(data.secret_text))
      // Catch network or 404 errors and update error state message
      .catch((err) => setError(err.message));
  }, [viewId]);

  // Submit handler function triggered when user clicks Generate Gayebi Link button
  const handleCreate = async (e) => {
    // Prevent default browser HTML form submission page reload
    e.preventDefault();
    // Send asynchronous HTTP POST request to API endpoint with input secret text
    const res = await fetch('/api/secrets', {
      // Set HTTP method to POST for creating new secret resource
      method: 'POST',
      // Set request headers specifying JSON payload content format
      headers: { 'Content-Type': 'application/json' },
      // Convert secret text state into JSON string body
      body: JSON.stringify({ secret_text: text })
    });
    // Parse returned JSON payload containing generated secret ID token
    const data = await res.json();
    // Store generated secret ID in state to switch UI into Generated Link mode
    setSecretId(data.id);
  };

  // Construct complete shareable absolute URL incorporating origin and secret ID
  const shareUrl = `${window.location.origin}/secret/${secretId}`;

  // Copy handler function triggered when user clicks Copy button
  const handleCopy = () => {
    // Copy constructed shareUrl string directly to system clipboard
    navigator.clipboard.writeText(shareUrl);
    // Set copied state flag to true to update button text feedback
    setCopied(true);
    // Set temporary timeout to reset copied state flag back to false after 2 seconds
    setTimeout(() => setCopied(false), 2000);
  };

  // Render JSX markup for the Gayebi-Pass single page interface
  return (
    // Outer page container with full screen height and centered light gray background
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', boxSizing: 'border-box' }}>
      {/* Central card container element styled with clean white background and drop shadow */}
      <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)', width: '100%', maxWidth: '460px', border: '1px solid #eaeaea' }}>
        {/* Main application title heading formatted according to requirement */}
        <h1 style={{ margin: '0 0 6px 0', fontSize: '24px', color: '#111111', textAlign: 'center', fontWeight: '700' }}>Gayebi-Pass 🔒</h1>
        {/* Application subtitle tagline formatted according to requirement */}
        <p style={{ margin: '0 0 24px 0', color: '#666666', textAlign: 'center', fontSize: '14px' }}>One-time Secret Sharing</p>

        {/* State 3: Secret Viewer Mode rendered if viewing a secret URL */}
        {isViewMode ? (
          // Container block for displaying retrieved secret or expired error status
          <div>
            {/* Conditional check if error state contains message (e.g. 404 Link expired) */}
            {error ? (
              // Styled red alert box displaying link expired error message
              <div style={{ padding: '16px', backgroundColor: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '8px', color: '#e53e3e', textAlign: 'center', fontWeight: '600', fontSize: '15px' }}>
                {/* Render error string content */}
                {error}
              </div>
            ) : viewSecret ? (
              // Styled block displaying successfully fetched secret content
              <div>
                {/* Green highlighted box wrapper displaying the revealed secret text */}
                <div style={{ padding: '16px', backgroundColor: '#f0fff4', border: '1px solid #c6f6d5', borderRadius: '8px', marginBottom: '16px', wordBreak: 'break-all', fontSize: '16px', fontWeight: '600', color: '#276749' }}>
                  {/* Render the retrieved secret text string */}
                  {viewSecret}
                </div>
                {/* Yellow warning alert box emphasizing database deletion */}
                <div style={{ padding: '12px 16px', backgroundColor: '#fffaf0', border: '1px solid #feebc8', borderRadius: '8px', color: '#c05621', fontSize: '13px', textAlign: 'center', fontWeight: '500' }}>
                  {/* Required warning text label */}
                  ⚠️ This password/PIN has been permanently deleted from the database.
                </div>
              </div>
            ) : (
              // Loading fallback message rendered while auto-fetch request resolves
              <p style={{ textAlign: 'center', color: '#718096', fontSize: '14px' }}>Fetching secret content...</p>
            )}
          </div>
        ) : secretId ? (
          /* State 2: Generated Link Mode rendered after secret is submitted */
          <div>
            {/* Instructional label heading above generated link input */}
            <p style={{ fontSize: '14px', color: '#2d3748', marginBottom: '8px', fontWeight: '500' }}>Your secret link is ready:</p>
            {/* Read-only input field displaying generated shareable URL link */}
            <input type="text" readOnly value={shareUrl} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '13px', marginBottom: '14px', boxSizing: 'border-box', backgroundColor: '#f7fafc', color: '#2d3748' }} />
            {/* Copy button triggering handleCopy clipboard function */}
            <button onClick={handleCopy} style={{ width: '100%', padding: '12px', backgroundColor: '#3182ce', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', transition: 'background-color 0.2s' }}>
              {/* Button text dynamically toggling based on copied state */}
              {copied ? 'Copied to Clipboard! ✓' : 'Copy Link'}
            </button>
          </div>
        ) : (
          /* State 1: Create Mode form rendered for typing new secret */
          <form onSubmit={handleCreate}>
            {/* Textarea element for user to input sensitive content */}
            <textarea
              // Bind textarea controlled value to text state variable
              value={text}
              // Update text state on every keystroke in textarea
              onChange={(e) => setText(e.target.value)}
              // Placeholder prompt inside empty textarea
              placeholder="Paste your sensitive PIN, Password, or Card CVV here..."
              // Set rows count for comfortable input height
              rows={4}
              // Require user input before submitting form
              required
              // Inline CSS for clean full-width textarea styling
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '14px', marginBottom: '18px', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' }}
            />
            {/* Submit button for triggering link creation */}
            <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#1a202c', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
              {/* Button text label */}
              Generate Gayebi Link
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
