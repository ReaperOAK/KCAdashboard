
import React from 'react';

// ReplyCard: Pure, focused, beautiful, responsive
const ReplyCard = React.memo(function ReplyCard({ reply }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-white font-semibold text-base">
        {reply.user_name.charAt(0)}
      </div>
      <div>
        <h3 className="text-sm font-medium">
          {reply.user_name}
          <span className="text-xs font-normal text-gray-dark ml-2">
            {reply.user_role} • {new Date(reply.created_at).toLocaleString()}
          </span>
        </h3>
        <p className="text-sm text-gray-dark mt-1 whitespace-pre-line">{reply.message}</p>
      </div>
    </div>
  );
});

ReplyCard.displayName = 'ReplyCard';

// DiscussionCard: Pure, focused, beautiful, responsive
const DiscussionCard = React.memo(function DiscussionCard({ discussion }) {
  return (
    <div className="bg-white border border-gray-light rounded-xl shadow-md overflow-hidden ">
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-lg">
            {discussion.user_name.charAt(0)}
          </div>
          <div>
            <h3 className="font-medium text-text-dark">
              {discussion.user_name}
              <span className="text-xs font-normal text-gray-dark ml-2">
                {discussion.user_role} • {new Date(discussion.created_at).toLocaleString()}
              </span>
            </h3>
            <p className="text-gray-dark mt-1 whitespace-pre-line">{discussion.message}</p>
          </div>
        </div>
      </div>
      {discussion.replies && discussion.replies.length > 0 && (
        <div className="bg-background-light p-4 border-t border-gray-light">
          <h4 className="text-sm font-medium text-gray-dark mb-2">Replies</h4>
          <div className="flex flex-col gap-3 pl-2 sm:pl-6">
            {discussion.replies.map(reply => (
              <ReplyCard key={reply.id} reply={reply} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

DiscussionCard.displayName = 'DiscussionCard';

const ClassroomDiscussionsTab = React.memo(function ClassroomDiscussionsTab({
  discussions,
  newDiscussion,
  handleDiscussionInput,
  handlePostDiscussion,
  submitting
}) {
  return (
    <section className="w-full max-w-3xl mx-auto px-2 sm:px-4 md:px-6 lg:px-0 ">
      <h2 className="text-2xl text-text-dark font-semibold mb-6">Class Discussions</h2>
      <div className="mb-8 bg-background-light rounded-xl shadow-inner border border-gray-light p-4">
        <label className="block text-sm text-gray-dark mb-2 font-medium">Start a New Discussion</label>
        <textarea
          value={newDiscussion}
          onChange={handleDiscussionInput}
          className="block w-full rounded-md border border-gray-light shadow-sm focus:border-secondary focus:ring-2 focus:ring-secondary focus:ring-opacity-50 px-3 py-2 bg-white dark:bg-background-dark text-text-dark transition-all duration-200"
          rows={3}
          placeholder="Share your thoughts with the class..."
          aria-label="New discussion message"
          maxLength={500}
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-dark">{newDiscussion.length}/500</span>
          <button
            onClick={handlePostDiscussion}
            disabled={!newDiscussion.trim() || submitting}
            className={[
              'px-4 py-2 rounded-md font-semibold transition-all duration-200',
              'bg-secondary text-white hover:bg-accent',
              'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
              (!newDiscussion.trim() || submitting) ? 'bg-gray-dark text-gray-light cursor-not-allowed opacity-60' : '',
            ].join(' ')}
            aria-label="Post discussion"
            tabIndex={0}
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-accent" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                Posting...
              </span>
            ) : 'Post Discussion'}
          </button>
        </div>
      </div>
      {discussions.length > 0 ? (
        <div className="flex flex-col gap-8">
          {discussions.map(discussion => (
            <DiscussionCard key={discussion.id} discussion={discussion} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[180px] bg-background-light rounded-xl shadow-inner border border-gray-light ">
          <svg className="h-12 w-12 text-gray-light mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2h2M15 3h-6a2 2 0 00-2 2v3a2 2 0 002 2h6a2 2 0 002-2V5a2 2 0 00-2-2z" /></svg>
          <p className="text-gray-dark text-lg">No discussions have been started yet. Be the first to post!</p>
        </div>
      )}
    </section>
  );
});

ClassroomDiscussionsTab.displayName = 'ClassroomDiscussionsTab';

export default ClassroomDiscussionsTab;
