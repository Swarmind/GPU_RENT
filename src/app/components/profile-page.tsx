import { Wallet, Activity, Clock, MapPin } from "lucide-react";
import { useAuth } from "../contexts/auth-context";
import { Card, CardContent } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle } from "lucide-react";
import { Link } from "react-router";

export function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20">
        <div className="container mx-auto px-6 py-12">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please sign in to view your profile.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const stats = {
    memberSince: "March 2026",
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="container mx-auto px-6 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Profile</h1>
          <p className="text-slate-600">Manage your account and view your activity</p>
        </div>

        {/* Profile Card */}
        <Card className="mb-8">
          <CardContent className="py-8">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
                {user.username.charAt(0).toUpperCase()}
              </div>

              {/* User Info */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900 mb-1">{user.username}</h2>
                <p className="text-slate-600 mb-4">{user.email}</p>
                
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Clock className="w-4 h-4" />
                  <span>Member since {stats.memberSince}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/deployments">
            <Card className="hover:shadow-lg transition cursor-pointer">
              <CardContent className="py-6 text-center">
                <Activity className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <h3 className="font-medium text-slate-900">My Deployments</h3>
                <p className="text-sm text-slate-600 mt-1">View active instances</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/wallet">
            <Card className="hover:shadow-lg transition cursor-pointer">
              <CardContent className="py-6 text-center">
                <Wallet className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <h3 className="font-medium text-slate-900">Wallet</h3>
                <p className="text-sm text-slate-600 mt-1">Manage funds</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/marketplace">
            <Card className="hover:shadow-lg transition cursor-pointer">
              <CardContent className="py-6 text-center">
                <MapPin className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <h3 className="font-medium text-slate-900">Marketplace</h3>
                <p className="text-sm text-slate-600 mt-1">Rent GPU instances</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
