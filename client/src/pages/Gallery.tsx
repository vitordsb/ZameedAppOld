
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Heart, MessageSquare, Share2, ImageOff, Send } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { getInitials, formatRelativeTime } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import ApplicationLayout from "@/components/layouts/ApplicationLayout";

// Redesigned Gallery Feed
export default function Gallery() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [newComment, setNewComment] = useState("");
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { isLoggedIn } = useAuth();
  const [, navigate] = useLocation();

  // Fetch posts
  const { data: posts = [], isError } = useQuery<any[]>({ queryKey: ["/api/posts"] });

  // Mutations
  const likeMutation = useMutation(
    (postId: number) => apiRequest('POST', `/api/posts/${postId}/like`),
    { onSuccess: () => queryClient.invalidateQueries(["/api/posts"]) }
  );
  const commentMutation = useMutation(
    ({ postId, content }: { postId: number; content: string }) =>
      apiRequest('POST', `/api/posts/${postId}/comments`, { content }),
    { onSuccess: () => queryClient.invalidateQueries(["/api/posts"]) }
  );

  // Handlers
  const handleLike = (postId: number) => {
    if (!isLoggedIn) return setShowAuthDialog(true);
    likeMutation.mutate(postId);
  };
  const handleComment = (postId: number) => {
    if (!isLoggedIn) return setShowAuthDialog(true);
    if (newComment.trim()) {
      commentMutation.mutate({ postId, content: newComment });
      setNewComment("");
    }
  };
  const closeDialog = () => setSelectedPost(null);
  const promptLogin = () => (setShowAuthDialog(false), navigate('/auth'));

  // Filter feed by search
  const feed = posts.filter(
    p =>
      p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.designer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ApplicationLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Search bar */}
        <div className="mb-6">
          <Input
            placeholder="Search posts or designers..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Error state */}
        {isError && (
          <p className="text-center text-red-500 mb-4">Failed to load feed.</p>
        )}

        {/* Feed Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
          {feed.map(post => (
            <div
              key={post.id}
              className="flex flex-col bg-white border rounded-lg shadow-sm overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center p-4">
                <Avatar className="mr-3">
                  <AvatarImage src={post.designer.profileImage} />
                  <AvatarFallback>{getInitials(post.designer.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{post.designer.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatRelativeTime(new Date(post.createdAt))}
                  </p>
                </div>
                <Button size="icon" variant="ghost" onClick={() => setSelectedPost(post)}>
                  <span className="sr-only">Open details</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v1h7a1 1 0 110 2h-7v1a1 1 0 11-2 0V7H2a1 1 0 110-2h7V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </Button>
              </div>

              {/* Image */}
              {post.image ? (
                <img
                  src={post.image}
                  alt="Post"
                  className="w-full h-64 object-cover"
                />
              ) : (
                <div className="w-full h-64 flex items-center justify-center bg-gray-100">
                  <ImageOff className="h-10 w-10 text-gray-400" />
                </div>
              )}

              {/* Engagement Bar */}
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex space-x-4">
                  <Button
                    variant="ghost"
                    onClick={() => handleLike(post.id)}
                    className="flex items-center"
                  >
                    <Heart className="h-5 w-5 text-red-500 mr-1" />
                    <span className="text-sm text-gray-700">{post.likeCount}</span>
                  </Button>
                  <Button variant="ghost" className="flex items-center">
                    <MessageSquare className="h-5 w-5 text-gray-500 mr-1" />
                    <span className="text-sm text-gray-700">{post.commentCount}</span>
                  </Button>
                </div>
                <Button variant="ghost">
                  <Share2 className="h-5 w-5 text-gray-500" />
                </Button>
              </div>

              {/* Caption & Comments */}
              <div className="px-4 pb-4">
                <p className="text-sm mb-2">
                  <span className="font-semibold mr-1">{post.designer.name}:</span>
                  {post.content}
                </p>
                <Separator />
                <div className="mt-2 space-y-2">
                  {post.comments.slice(0, 2).map((c: any) => (
                    <div key={c.id} className="flex items-start">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarImage src={c.user.profileImage} />
                        <AvatarFallback>{getInitials(c.user.name)}</AvatarFallback>
                      </Avatar>
                      <p className="text-xs break-words">
                        <span className="font-semibold mr-1">{c.user.name}:</span>
                        {c.content}
                      </p>
                    </div>
                  ))}
                  {post.commentCount > 2 && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => setSelectedPost(post)}
                    >
                      View all {post.commentCount} comments
                    </Button>
                  )}
                </div>

                {/* Add Comment */}
                <div className="mt-4 flex items-center border-t pt-3">
                  <Textarea
                    placeholder="Add a comment..."
                    className="flex-1 mr-2 min-h-10"
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                  />
                  <Button size="icon" onClick={() => handleComment(post.id)}>
                    <Send className="h-5 w-5 text-gray-500" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Post Details Dialog */}
        <Dialog open={!!selectedPost} onOpenChange={closeDialog}>
          <DialogContent className="max-w-xl w-full">
            {selectedPost && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <DialogTitle>{selectedPost.designer.name}'s Post</DialogTitle>
                  <Button size="icon" variant="ghost" onClick={closeDialog}>
                    <span className="sr-only">Close</span>
                    <X className="h-5 w-5 text-gray-500" />
                  </Button>
                </div>
                {selectedPost.image && (
                  <img
                    src={selectedPost.image}
                    alt="Full view"
                    className="w-full max-h-96 object-contain rounded-lg"
                  />
                )}
                <p className="text-gray-700">{selectedPost.content}</p>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Auth Prompt Dialog */}
        <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
          <DialogContent>
            <DialogTitle>Login Required</DialogTitle>
            <p className="mt-2 text-sm text-gray-600">
              You need to log in to interact with posts.
            </p>
            <div className="flex justify-end mt-4 space-x-2">
              <Button variant="outline" onClick={() => setShowAuthDialog(false)}>
                Cancel
              </Button>
              <Button onClick={promptLogin}>Log in</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ApplicationLayout>
  );
}

