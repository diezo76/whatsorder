'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Clock, LogOut, Loader2, RefreshCw, Store } from 'lucide-react';

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  phone: string;
  isApproved: boolean;
  isBusy: boolean;
  createdAt: string;
  users: { id: string; name: string; email: string }[];
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');

  const getToken = () => localStorage.getItem('admin_token');

  const fetchRestaurants = useCallback(async () => {
    const token = getToken();
    if (!token) {
      router.push('/admin');
      return;
    }

    try {
      const response = await fetch('/api/admin/restaurants', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('admin_token');
        router.push('/admin');
        return;
      }

      const data = await response.json();
      if (data.success) {
        setRestaurants(data.restaurants);
        setStats(data.stats);
      }
    } catch {
      console.error('Error fetching restaurants');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/admin');
      return;
    }
    fetchRestaurants();
  }, [router, fetchRestaurants]);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    const token = getToken();
    if (!token) return;

    setActionLoading(id);

    try {
      const response = await fetch(`/api/admin/restaurants/${id}/${action}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        await fetchRestaurants();
      }
    } catch {
      console.error(`Error ${action} restaurant`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin');
  };

  const filteredRestaurants = restaurants.filter((r) => {
    if (filter === 'pending') return !r.isApproved;
    if (filter === 'approved') return r.isApproved;
    return true;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Super Admin</h1>
          <p className="text-sm text-gray-500">Gestion des restaurants</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setLoading(true); fetchRestaurants(); }}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Deconnexion
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-orange-100">
          <p className="text-sm text-orange-600">En attente</p>
          <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-green-100">
          <p className="text-sm text-green-600">Approuves</p>
          <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {(['all', 'pending', 'approved'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              filter === f
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {f === 'all' ? 'Tous' : f === 'pending' ? 'En attente' : 'Approuves'}
            {f === 'pending' && stats.pending > 0 && (
              <span className="ml-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                {stats.pending}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Restaurant list */}
      <div className="space-y-3">
        {filteredRestaurants.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
            <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aucun restaurant</p>
          </div>
        ) : (
          filteredRestaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {restaurant.name}
                  </h3>
                  {restaurant.isApproved ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      Approuve
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-700 text-xs font-medium rounded-full">
                      <Clock className="w-3 h-3" />
                      En attente
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500 space-y-0.5">
                  <p>
                    /{restaurant.slug}
                    {restaurant.users[0] && (
                      <span className="ml-3">
                        Owner: {restaurant.users[0].name} ({restaurant.users[0].email})
                      </span>
                    )}
                  </p>
                  <p>
                    {restaurant.phone}
                    {restaurant.email && <span className="ml-3">{restaurant.email}</span>}
                    <span className="ml-3">{formatDate(restaurant.createdAt)}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!restaurant.isApproved ? (
                  <button
                    onClick={() => handleAction(restaurant.id, 'approve')}
                    disabled={actionLoading === restaurant.id}
                    className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    {actionLoading === restaurant.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Approuver
                  </button>
                ) : (
                  <button
                    onClick={() => handleAction(restaurant.id, 'reject')}
                    disabled={actionLoading === restaurant.id}
                    className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-200 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === restaurant.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    Rejeter
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
