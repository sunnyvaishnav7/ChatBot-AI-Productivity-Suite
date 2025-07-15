import { useState } from "react";
import "./ChatResponse.css";

const ChatResponse = ({ response, loading = false, error = null }) => {
  const [expandedCandidates, setExpandedCandidates] = useState(new Set());
  const [showMetadata, setShowMetadata] = useState(false);

  const toggleCandidate = (index) => {
    const newExpanded = new Set(expandedCandidates);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedCandidates(newExpanded);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add toast notification here
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const formatText = (text) => {
    if (!text) return '';
    
    // Convert line breaks to <br> tags and handle basic formatting
    return text
      .split('\n')
      .map((line, index) => (
        <span key={index}>
          {line}
          {index < text.split('\n').length - 1 && <br />}
        </span>
      ));
  };

  const truncateText = (text, maxLength = 300) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="chat-response-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Generating response...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chat-response-container">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3 className="error-title">Error</h3>
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  if (!response) {
    return null;
  }

  const { candidates, usageMetadata } = response;

  return (
    <div className="chat-response-container">
      <div className="response-header">
        <h3 className="response-title">Response</h3>
        <div className="response-actions">
          <button
            className="metadata-toggle"
            onClick={() => setShowMetadata(!showMetadata)}
          >
            {showMetadata ? 'Hide' : 'Show'} Metadata
          </button>
        </div>
      </div>

      <div className="candidates-container">
        {candidates?.map((candidate, index) => {
          const isExpanded = expandedCandidates.has(index);
          const text = candidate?.content?.parts?.[0]?.text || '';
          const displayText = isExpanded ? text : truncateText(text);
          const hasMore = text.length > 300;

          return (
            <div className="candidate-card" key={index}>
              <div className="candidate-header">
                <h5 className="candidate-title">
                  {candidates.length > 1 ? `Response ${index + 1}` : 'Response'}
                </h5>
                <div className="candidate-actions">
                  <button
                    className="action-btn copy-btn"
                    onClick={() => copyToClipboard(text)}
                    title="Copy to clipboard"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  </button>
                  {hasMore && (
                    <button
                      className="action-btn expand-btn"
                      onClick={() => toggleCandidate(index)}
                    >
                      {isExpanded ? 'Show Less' : 'Show More'}
                    </button>
                  )}
                </div>
              </div>

              <div className="candidate-content">
                <div className="response-text">
                  {formatText(displayText)}
                </div>

                {candidate?.citationMetadata?.citationSources?.length > 0 && (
                  <div className="citations-section">
                    <h6 className="citations-title">Citations:</h6>
                    <ul className="citations-list">
                      {candidate.citationMetadata.citationSources.map((source, idx) => (
                        <li key={idx} className="citation-item">
                          <a
                            href={source.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="citation-link"
                          >
                            {source.uri}
                          </a>
                          <span className="citation-indexes">
                            (Indexes: {source.startIndex} - {source.endIndex})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showMetadata && usageMetadata && (
        <div className="metadata-section">
          <h4 className="metadata-title">Usage Metadata</h4>
          <div className="metadata-grid">
            <div className="metadata-item">
              <span className="metadata-label">Prompt Tokens:</span>
              <span className="metadata-value">{usageMetadata.promptTokenCount || 0}</span>
            </div>
            <div className="metadata-item">
              <span className="metadata-label">Response Tokens:</span>
              <span className="metadata-value">{usageMetadata.candidatesTokenCount || 0}</span>
            </div>
            <div className="metadata-item">
              <span className="metadata-label">Total Tokens:</span>
              <span className="metadata-value">{usageMetadata.totalTokenCount || 0}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatResponse;