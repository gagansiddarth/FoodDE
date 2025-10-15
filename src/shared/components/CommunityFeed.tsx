import React, { useState } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { 
  Search, 
  Filter, 
  TrendingUp, 
  Plus,
  Send,
  Image as ImageIcon
} from 'lucide-react';
import CommunityPost from './CommunityPost';

// Auto-generated Indian community posts with comments
const generateIndianPosts = () => [
  {
    id: '1',
    user: {
      name: 'Priya Sharma',
      avatar: undefined,
      location: 'Mumbai, Maharashtra'
    },
    scan: {
      productName: 'Britannia Good Day Cookies',
      healthScore: 42,
      flags: ['Palm Oil', 'High Sugar', 'Artificial Flavors'],
      summary: 'Found these cookies have high sugar content and palm oil. Not ideal for daily consumption.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
    },
    content: 'Just scanned these cookies that my kids love! 😱 Shocked to see the palm oil and high sugar content. The FoodDE\'s score of 42 is quite concerning. Anyone found better alternatives for kids? Looking for something with natural ingredients and less sugar. #HealthySnacks #KidsHealth #FoodScan',
    likes: 127,
    comments: 23,
    reposts: 8,
    shares: 12,
    isLiked: false,
    isReposted: false,
    commentsList: [
      {
        id: 'c1',
        user: 'Aarav Mehta',
        content: 'Same here! My kids are addicted to these. I found some organic cookies from Nature\'s Basket that have 70+ FoodDE\'s score. Much better!',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        likes: 8
      },
      {
        id: 'c2',
        user: 'Dr. Kavya Reddy',
        content: 'As a pediatrician, I always recommend avoiding palm oil for kids. It can cause digestive issues. Try homemade cookies with jaggery instead!',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        likes: 15
      },
      {
        id: 'c3',
        user: 'Rahul Singh',
        content: 'Britannia needs to improve their ingredients! So many parents trust this brand. We should start a petition!',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        likes: 12
      }
    ]
  },
  {
    id: '2',
    user: {
      name: 'Rajesh Patel',
      avatar: undefined,
      location: 'Ahmedabad, Gujarat'
    },
    scan: {
      productName: 'Amul Gold Milk',
      healthScore: 89,
      flags: [],
      summary: 'Pure milk with good protein content. No harmful additives detected.',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() // 4 hours ago
    },
    content: 'Amul Gold Milk gets a great FoodDE\'s score of 89! 🥛✅ This is what I give to my family daily. Pure, natural, and no artificial preservatives. The protein content is excellent for growing kids. Trust Amul for quality! #AmulGold #PureMilk #HealthyChoice #FamilyHealth',
    likes: 89,
    comments: 15,
    reposts: 12,
    shares: 8,
    isLiked: true,
    isReposted: false,
    commentsList: [
      {
        id: 'c4',
        user: 'Meera Patel',
        content: 'Amul Gold is my go-to choice too! The protein content is perfect for my growing daughter. Great FoodDE\'s score!',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        likes: 6
      },
      {
        id: 'c5',
        user: 'Vikram Desai',
        content: 'I switched from other brands to Amul Gold last year. No more digestive issues and my kids love the taste!',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        likes: 4
      },
      {
        id: 'c6',
        user: 'Anjali Kapoor',
        content: 'Amul Gold + turmeric + honey = perfect immunity booster for kids! Try this combination.',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        likes: 9
      }
    ]
  },
  {
    id: '3',
    user: {
      name: 'Anjali Reddy',
      avatar: undefined,
      location: 'Hyderabad, Telangana'
    },
    scan: {
      productName: 'Kurkure Masala Munch',
      healthScore: 28,
      flags: ['MSG', 'Artificial Colors', 'High Sodium', 'Palm Oil'],
      summary: 'Multiple artificial additives detected. High sodium content and artificial colors make this a poor choice.',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() // 6 hours ago
    },
    content: 'OMG! 😨 Kurkure Masala Munch scored only 28! The artificial colors and MSG are really concerning. I used to love these but now I\'m switching to homemade snacks. Anyone have good recipes for spicy snacks without artificial stuff? #HomemadeSnacks #NoArtificial #HealthyLiving #FoodAwareness',
    likes: 203,
    comments: 45,
    reposts: 18,
    shares: 25,
    isLiked: false,
    isReposted: true,
    commentsList: [
      {
        id: 'c7',
        user: 'Sanjay Verma',
        content: 'I used to eat Kurkure daily! After seeing this scan, I\'m completely shocked. Time to quit junk food!',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        likes: 18
      },
      {
        id: 'c8',
        user: 'Pooja Sharma',
        content: 'Try Haldiram\'s baked snacks instead! Much healthier and still tasty. My kids love the baked chips.',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        likes: 12
      },
      {
        id: 'c9',
        user: 'Rajesh Kumar',
        content: 'MSG is really bad for health. I had no idea Kurkure had so many artificial ingredients. Thanks for sharing!',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        likes: 15
      },
      {
        id: 'c10',
        user: 'Dr. Priya Iyer',
        content: 'As a nutritionist, I always warn my clients about these snacks. The artificial colors can cause hyperactivity in children.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        likes: 22
      }
    ]
  },
  {
    id: '4',
    user: {
      name: 'Vikram Singh',
      avatar: undefined,
      location: 'Delhi, NCR'
    },
    scan: {
      productName: 'Organic Quinoa Seeds',
      healthScore: 95,
      flags: [],
      summary: 'Excellent superfood with high protein and fiber. No harmful substances detected.',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() // 8 hours ago
    },
    content: 'Quinoa seeds are a game changer! 🌱✨ FoodDE\'s score of 95! Perfect for weight loss and muscle building. I make quinoa pulao and it tastes amazing. Much better than white rice. Anyone tried quinoa recipes? Share your favorites! #Quinoa #Superfood #HealthyEating #WeightLoss',
    likes: 156,
    comments: 32,
    reposts: 14,
    shares: 9,
    isLiked: false,
    isReposted: false,
    commentsList: [
      {
        id: 'c11',
        user: 'Aisha Khan',
        content: 'Quinoa is amazing! I make quinoa biryani and it tastes better than rice. Great for weight management!',
        timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
        likes: 8
      },
      {
        id: 'c12',
        user: 'Ravi Menon',
        content: 'Where do you buy quinoa in Delhi? I\'ve been looking for organic quinoa but it\'s quite expensive.',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        likes: 5
      },
      {
        id: 'c13',
        user: 'Neha Gupta',
        content: 'Try BigBasket or Nature\'s Basket for organic quinoa. It\'s worth the price for the health benefits!',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        likes: 7
      }
    ]
  },
  {
    id: '5',
    user: {
      name: 'Meera Iyer',
      avatar: undefined,
      location: 'Bangalore, Karnataka'
    },
    scan: {
      productName: 'Haldiram\'s Namkeen Mix',
      healthScore: 35,
      flags: ['High Sodium', 'Palm Oil', 'Artificial Preservatives'],
      summary: 'Traditional snack but high in sodium and contains artificial preservatives.',
      timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString() // 10 hours ago
    },
    content: 'Haldiram\'s Namkeen scored 35 😔 Traditional taste but not so healthy. High sodium and artificial preservatives. I\'m trying to find authentic homemade namkeen recipes. Anyone know where to get traditional spices without additives? #TraditionalFood #HealthyNamkeen #Homemade #IndianCuisine',
    likes: 98,
    comments: 28,
    reposts: 7,
    shares: 11,
    isLiked: true,
    isReposted: false,
    commentsList: [
      {
        id: 'c14',
        user: 'Kavita Sharma',
        content: 'Haldiram\'s traditional namkeen is so tasty but unhealthy. I\'m trying to find authentic homemade recipes.',
        timestamp: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
        likes: 6
      },
      {
        id: 'c15',
        user: 'Amit Patel',
        content: 'Try making namkeen at home with roasted nuts and seeds. Much healthier and you control the ingredients!',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        likes: 8
      },
      {
        id: 'c16',
        user: 'Sunita Reddy',
        content: 'I get my spices from local organic farms. No artificial preservatives and much better taste!',
        timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
        likes: 4
      }
    ]
  },
  {
    id: '6',
    user: {
      name: 'Arjun Kumar',
      avatar: undefined,
      location: 'Chennai, Tamil Nadu'
    },
    scan: {
      productName: 'Fresh Coconut Water',
      healthScore: 92,
      flags: [],
      summary: 'Natural electrolyte drink with no additives. Excellent for hydration.',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() // 12 hours ago
    },
    content: 'Fresh coconut water is nature\'s energy drink! 🥥💧 FoodDE\'s score 92! Perfect post-workout drink. Natural electrolytes, no artificial sweeteners. I drink this daily after gym. Much better than those colored energy drinks. #CoconutWater #NaturalEnergy #PostWorkout #HealthyHydration',
    likes: 134,
    comments: 19,
    reposts: 11,
    shares: 6,
    isLiked: false,
    isReposted: false,
    commentsList: [
      {
        id: 'c17',
        user: 'Deepak Singh',
        content: 'Coconut water is the best! I drink it after every workout. Much better than those expensive sports drinks.',
        timestamp: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString(),
        likes: 7
      },
      {
        id: 'c18',
        user: 'Priya Desai',
        content: 'I add a pinch of salt to coconut water for better electrolyte balance. Perfect for summer!',
        timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
        likes: 5
      }
    ]
  },
  {
    id: '7',
    user: {
      name: 'Sneha Iyer',
      avatar: undefined,
      location: 'Pune, Maharashtra'
    },
    scan: {
      productName: 'Nestle Maggi Masala Noodles',
      healthScore: 31,
      flags: ['High Sodium', 'MSG', 'Artificial Colors', 'Palm Oil'],
      summary: 'Popular instant noodles with multiple artificial additives and high sodium content.',
      timestamp: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString() // 14 hours ago
    },
    content: 'Maggi lovers, this is a wake-up call! 😱 FoodDE\'s score only 31! High sodium, MSG, and artificial colors. I used to eat this daily in college. Now I make homemade noodles with whole wheat flour and natural spices. Much healthier! #Maggi #Homemade #HealthyAlternatives #CollegeLife',
    likes: 287,
    comments: 67,
    reposts: 34,
    shares: 28,
    isLiked: false,
    isReposted: false,
    commentsList: [
      {
        id: 'c19',
        user: 'Rahul Verma',
        content: 'Maggi was my survival food in hostel! 😅 But you\'re right, it\'s really unhealthy. Any good homemade noodle recipes?',
        timestamp: new Date(Date.now() - 13 * 60 * 60 * 1000).toISOString(),
        likes: 18
      },
      {
        id: 'c20',
        user: 'Dr. Anjali Kapoor',
        content: 'MSG can cause headaches and nausea. I see many patients with these symptoms from regular Maggi consumption.',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        likes: 25
      },
      {
        id: 'c21',
        user: 'Vikram Sharma',
        content: 'I switched to organic ramen from local stores. Much better ingredients and still quick to make!',
        timestamp: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString(),
        likes: 12
      }
    ]
  },
  {
    id: '8',
    user: {
      name: 'Karan Malhotra',
      avatar: undefined,
      location: 'Jaipur, Rajasthan'
    },
    scan: {
      productName: 'Organic Honey',
      healthScore: 88,
      flags: [],
      summary: 'Pure natural honey with no artificial additives. Excellent source of antioxidants.',
      timestamp: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString() // 16 hours ago
    },
    content: 'Local organic honey from Rajasthan! 🍯✨ FoodDE\'s score 88! No artificial sweeteners, pure natural goodness. I use this in my morning tea instead of sugar. The taste is amazing and it\'s so much healthier. Support local beekeepers! #OrganicHoney #LocalBusiness #HealthySweetener #Rajasthan',
    likes: 89,
    comments: 23,
    reposts: 9,
    shares: 7,
    isLiked: true,
    isReposted: false,
    commentsList: [
      {
        id: 'c22',
        user: 'Meera Singh',
        content: 'Rajasthan honey is the best! I get mine from a local farmer. Much better than supermarket brands.',
        timestamp: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(),
        likes: 8
      },
      {
        id: 'c23',
        user: 'Amit Kumar',
        content: 'Honey + ginger + lemon in warm water every morning. Perfect immunity booster!',
        timestamp: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
        likes: 11
      }
    ]
  }
];

const CommunityFeed: React.FC = () => {
  const [posts, setPosts] = useState(generateIndianPosts());
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            isLiked: !post.isLiked 
          }
        : post
    ));
  };

  const handleRepost = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            reposts: post.isReposted ? post.reposts - 1 : post.reposts + 1,
            isReposted: !post.isReposted 
          }
        : post
    ));
  };

  const handleComment = (postId: string) => {
    // TODO: Implement comment functionality
    console.log('Comment on post:', postId);
  };

  const handleAddComment = (postId: string, comment: string) => {
    const newComment = {
      id: `c${Date.now()}`,
      user: 'You',
      content: comment,
      timestamp: new Date().toISOString(),
      likes: 0
    };

    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            comments: post.comments + 1,
            commentsList: [...(post.commentsList || []), newComment]
          }
        : post
    ));
  };

  const handleShare = (postId: string) => {
    // TODO: Implement share functionality
    console.log('Share post:', postId);
  };

  const handleCreatePost = () => {
    if (newPostContent.trim()) {
      const newPost = {
        id: Date.now().toString(),
        user: {
          name: 'You',
          avatar: undefined,
          location: 'Your Location'
        },
        scan: {
          productName: 'Your Scan',
          healthScore: 0,
          flags: [],
          summary: 'Share your scan results!',
          timestamp: new Date().toISOString()
        },
        content: newPostContent,
        likes: 0,
        comments: 0,
        reposts: 0,
        shares: 0,
        isLiked: false,
        isReposted: false
      };
      
      setPosts(prev => [newPost, ...prev]);
      setNewPostContent('');
      setShowCreatePost(false);
    }
  };

  const filteredPosts = posts.filter(post =>
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.scan.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Community Feed</h1>
        <Button 
          onClick={() => setShowCreatePost(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
          <Input
            placeholder="Search posts, products, or users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
        <Button variant="outline">
          <TrendingUp className="w-4 h-4 mr-2" />
          Trending
        </Button>
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <Card className="p-4 border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
          <div className="flex items-start gap-3 mb-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                Y
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Share your scan results and thoughts..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="min-h-[100px] mb-3"
              />
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Add Image
                </Button>
                <Button 
                  onClick={handleCreatePost}
                  disabled={!newPostContent.trim()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Post
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowCreatePost(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Posts Feed */}
      <div className="space-y-4">
        {filteredPosts.map(post => (
          <CommunityPost
            key={post.id}
            post={post}
            onLike={handleLike}
            onComment={handleComment}
            onRepost={handleRepost}
            onShare={handleShare}
            onAddComment={handleAddComment}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredPosts.length === 0 && (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <p className="text-lg mb-2">No posts found</p>
            <p className="text-sm">Try adjusting your search or create the first post!</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default CommunityFeed;
