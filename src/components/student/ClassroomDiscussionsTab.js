import React from 'react';

const ClassroomDiscussionsTab = React.memo(({
  discussions,
  newDiscussion,
  handleDiscussionInput,
  handlePostDiscussion,
  submitting
}) => (
  <section>
    <h2 className="text-xl font-semibold text-primary mb-4">Class Discussions</h2>
    <div className="mb-6">
      <label className="block text-sm text-gray-dark mb-2">Start a New Discussion</label>
      <textarea
        value={newDiscussion}
        onChange={handleDiscussionInput}
        className="block w-full rounded-md border-gray-light shadow-sm focus:border-secondary focus:ring focus:ring-secondary focus:ring-opacity-50"
        rows={3}
        placeholder="Share your thoughts with the class..."
        aria-label="New discussion message"
      />
      <button
        onClick={handlePostDiscussion}
        disabled={!newDiscussion.trim() || submitting}
        className="mt-2 px-4 py-2 bg-secondary text-white rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 transition-colors"
        aria-label="Post discussion"
        tabIndex={0}
      >
        Post Discussion
      </button>
    </div>
    {discussions.length > 0 ? (
      <div className="space-y-6">
        {discussions.map(discussion => (
          <div key={discussion.id} className="bg-white border border-gray-light rounded-lg overflow-hidden">
            <div className="p-4">
              <div className="flex items-start mb-3">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold mr-3">
                  {discussion.user_name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-medium">
                    {discussion.user_name}
                    <span className="text-xs font-normal text-gray-dark ml-2">
                      {discussion.user_role} • {new Date(discussion.created_at).toLocaleString()}
                    </span>
                  </h3>
                  <p className="text-gray-dark mt-1">{discussion.message}</p>
                </div>
              </div>
            </div>
            {discussion.replies && discussion.replies.length > 0 && (
              <div className="bg-background-light p-4 border-t border-gray-light">
                <h4 className="text-sm font-medium text-gray-dark mb-2">Replies</h4>
                <div className="space-y-3 pl-6">
                  {discussion.replies.map(reply => (
                    <div key={reply.id} className="flex items-start">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-white font-semibold mr-3">
                        {reply.user_name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">
                          {reply.user_name}
                          <span className="text-xs font-normal text-gray-dark ml-2">
                            {reply.user_role} • {new Date(reply.created_at).toLocaleString()}
                          </span>
                        </h3>
                        <p className="text-sm text-gray-dark mt-1">{reply.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    ) : (
      <p>No discussions have been started yet. Be the first to post!</p>
    )}
  </section>
));

export default ClassroomDiscussionsTab;
