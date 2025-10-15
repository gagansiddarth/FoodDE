import React, { useState } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Input } from '@/shared/components/ui/input';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Repeat2, 
  MoreHorizontal,
  TriangleAlert,
  CheckCircle,
  Clock,
  MapPin
} from 'lucide-react';

interface CommunityPostProps {
  post: {
    id: string;
    user: {
      name: string;
      avatar?: string;
      location: string;
    };
    scan: {
      productName: string;
      healthScore: number;
      flags: string[];
      summary: string;
      timestamp: string;
    };
    content: string;
    likes: number;
    comments: number;
    reposts: number;
    shares: number;
    isLiked?: boolean;
    isReposted?: boolean;
    commentsList?: Array<{
      id: string;
      user: string;
      content: string;
      timestamp: string;
      likes: number;
    }>;
  };
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onRepost: (postId: string) => void;
  onShare: (postId: string) => void;
  onAddComment: (postId: string, comment: string) => void;
}

const CommunityPost: React.FC<CommunityPostProps> = ({ 
  post, 
  onLike, 
  onComment, 
  onRepost, 
  onShare,
  onAddComment
}) => {
  const [showFullContent, setShowFullContent] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'from-green-400 to-emerald-600';
    if (score >= 60) return 'from-yellow-400 to-orange-500';
    return 'from-red-400 to-pink-600';
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - postTime.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow border-border">
      {/* Post Header */}
      <div className="flex items-start gap-3 mb-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={post.user.avatar} />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            {post.user.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{post.user.name}</h3>
            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
              <MapPin className="w-3 h-3" />
              <span>{post.user.location}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
            <Clock className="w-3 h-3" />
            <span>{formatTimeAgo(post.scan.timestamp)}</span>
          </div>
        </div>
        
        <Button variant="ghost" size="sm" className="text-gray-500 dark:text-gray-400">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>

      {/* Post Content */}
      <div className="mb-3">
        <p className="text-gray-800 dark:text-gray-200 mb-3">
          {showFullContent ? post.content : post.content.slice(0, 150)}
          {post.content.length > 150 && (
            <Button 
              variant="link" 
              className="p-0 h-auto text-blue-600 dark:text-blue-400 ml-1"
              onClick={() => setShowFullContent(!showFullContent)}
            >
              {showFullContent ? 'Show less' : '...more'}
            </Button>
          )}
        </p>
      </div>

      {/* Scan Results Card */}
      <Card className="p-3 mb-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100">{post.scan.productName}</h4>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getHealthScoreColor(post.scan.healthScore)} flex items-center justify-center text-white text-xs font-bold`}>
              {post.scan.healthScore}
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400">FoodDE's Score</span>
          </div>
        </div>
        
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{post.scan.summary}</p>
        
        {post.scan.flags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {post.scan.flags.map((flag, index) => (
              <Badge key={index} variant="destructive" className="text-xs">
                <TriangleAlert className="w-3 h-3 mr-1" />
                {flag}
              </Badge>
            ))}
          </div>
        )}
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-6">
          {/* Like Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            className={`flex items-center gap-2 ${post.isLiked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}
            onClick={() => onLike(post.id)}
          >
            <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
            <span className="text-sm">{post.likes}</span>
          </Button>

          {/* Comment Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-2 text-gray-500 dark:text-gray-400"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm">{post.comments}</span>
          </Button>

          {/* Repost Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            className={`flex items-center gap-2 ${post.isReposted ? 'text-green-500' : 'text-gray-500 dark:text-gray-400'}`}
            onClick={() => onRepost(post.id)}
          >
            <Repeat2 className={`w-4 h-4 ${post.isReposted ? 'fill-current' : ''}`} />
            <span className="text-sm">{post.reposts}</span>
          </Button>

          {/* Share Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-2 text-gray-500 dark:text-gray-400"
            onClick={() => onShare(post.id)}
          >
            <Share2 className="w-4 h-4" />
            <span className="text-sm">{post.shares}</span>
          </Button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          {/* Add Comment */}
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && newComment.trim()) {
                  onAddComment(post.id, newComment);
                  setNewComment('');
                }
              }}
            />
            <Button 
              size="sm"
              onClick={() => {
                if (newComment.trim()) {
                  onAddComment(post.id, newComment);
                  setNewComment('');
                }
              }}
              disabled={!newComment.trim()}
            >
              Comment
            </Button>
          </div>

          {/* Comments List */}
          <div className="space-y-3">
            {post.commentsList && post.commentsList.map((comment) => (
              <div key={comment.id} className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {comment.user.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{comment.user}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{formatTimeAgo(comment.timestamp)}</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default CommunityPost;
