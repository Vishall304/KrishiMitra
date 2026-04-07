import React, { useState, useEffect } from 'react';
import { Mic, Plus, ShoppingBag, TrendingUp, MapPin, Loader2, Trash2, Package } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const mockBuyers = [
  { id: 1, name: 'Ramesh Traders', location: 'Pune', rating: 4.5 },
  { id: 2, name: 'Kisan Mandi', location: 'Nashik', rating: 4.2 },
  { id: 3, name: 'AgriConnect', location: 'Mumbai', rating: 4.8 },
];

export function MarketConnect({ onVoiceOpen }) {
  const { t, language } = useApp();
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  const [formData, setFormData] = useState({
    crop_name: '',
    quantity: '',
    unit: 'kg',
    price_per_unit: '',
    description: '',
    location: ''
  });

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    if (user?.village) {
      setFormData(prev => ({ ...prev, location: user.village }));
    }
  }, [user]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const storedToken = localStorage.getItem('krishi_token');
      const headers = storedToken ? { Authorization: `Bearer ${storedToken}` } : {};
      
      const [allRes, myRes] = await Promise.all([
        axios.get(`${API_URL}/api/market/listings`, { withCredentials: true, headers }),
        axios.get(`${API_URL}/api/market/my-listings`, { withCredentials: true, headers })
      ]);
      
      setListings(allRes.data);
      setMyListings(myRes.data);
    } catch (err) {
      console.error('Fetch listings error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateListing = async (e) => {
    e.preventDefault();
    if (!formData.crop_name || !formData.quantity) return;
    
    setSubmitting(true);
    try {
      const storedToken = localStorage.getItem('krishi_token');
      const headers = storedToken ? { Authorization: `Bearer ${storedToken}` } : {};
      
      await axios.post(
        `${API_URL}/api/market/listings`,
        formData,
        { withCredentials: true, headers }
      );
      
      setFormData({
        crop_name: '',
        quantity: '',
        unit: 'kg',
        price_per_unit: '',
        description: '',
        location: user?.village || ''
      });
      setShowForm(false);
      fetchListings();
    } catch (err) {
      console.error('Create listing error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteListing = async (id) => {
    try {
      const storedToken = localStorage.getItem('krishi_token');
      const headers = storedToken ? { Authorization: `Bearer ${storedToken}` } : {};
      
      await axios.delete(`${API_URL}/api/market/listings/${id}`, {
        withCredentials: true,
        headers
      });
      
      setMyListings(prev => prev.filter(l => l.id !== id));
      setListings(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      console.error('Delete listing error:', err);
    }
  };

  const displayListings = activeTab === 'my' ? myListings : listings;

  return (
    <div 
      className="flex-1 px-4 pt-6 pb-4 overflow-y-auto hide-scrollbar"
      data-testid="market-connect-screen"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 page-enter">
        <h1 className="text-2xl font-bold text-[#1F2924] font-['Outfit']">
          {t('market_title')}
        </h1>
        <div className="flex gap-2">
          <button
            onClick={onVoiceOpen}
            data-testid="market-voice-btn"
            className="w-10 h-10 rounded-xl bg-[#2F6944] flex items-center justify-center text-white hover:bg-[#224A30] transition-colors"
          >
            <Mic size={18} />
          </button>
          <button
            onClick={() => setShowForm(true)}
            data-testid="add-listing-btn"
            className="w-10 h-10 rounded-xl bg-[#F7F9F4] flex items-center justify-center text-[#2F6944] hover:bg-[#E4EBE5] transition-colors"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Voice CTA Card */}
      <button
        onClick={onVoiceOpen}
        data-testid="market-voice-cta"
        className="w-full card bg-gradient-to-r from-purple-500 to-indigo-500 text-white mb-6 hover:shadow-[0_8px_32px_rgba(139,92,246,0.3)] transition-all active:scale-[0.98]"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Mic size={24} />
          </div>
          <div className="text-left">
            <p className="font-semibold">{t('sell_your_produce')}</p>
            <p className="text-sm text-white/80">
              {language === 'hi' 
                ? '"मुझे 50 किलो टमाटर बेचना है" बोलें'
                : language === 'mr'
                ? '"मला 50 किलो टोमॅटो विकायचा आहे" बोला'
                : 'Say "I want to sell 50 kg tomatoes"'}
            </p>
          </div>
        </div>
      </button>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-[#F7F9F4] p-1.5 rounded-xl">
        <button
          onClick={() => setActiveTab('all')}
          data-testid="tab-all-listings"
          className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${
            activeTab === 'all'
              ? 'bg-white text-[#2F6944] shadow-sm'
              : 'text-[#5C7364] hover:text-[#2F6944]'
          }`}
        >
          {t('active_listings')}
        </button>
        <button
          onClick={() => setActiveTab('my')}
          data-testid="tab-my-listings"
          className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${
            activeTab === 'my'
              ? 'bg-white text-[#2F6944] shadow-sm'
              : 'text-[#5C7364] hover:text-[#2F6944]'
          }`}
        >
          {language === 'hi' ? 'मेरी लिस्टिंग' : language === 'mr' ? 'माझ्या याद्या' : 'My Listings'}
        </button>
      </div>

      {/* Add Listing Form */}
      {showForm && (
        <form 
          onSubmit={handleCreateListing}
          className="card mb-6 fade-in"
          data-testid="listing-form"
        >
          <h3 className="font-semibold text-[#1F2924] mb-4">{t('create_listing')}</h3>
          
          <div className="space-y-3">
            <input
              type="text"
              value={formData.crop_name}
              onChange={(e) => setFormData(prev => ({ ...prev, crop_name: e.target.value }))}
              placeholder={t('crop_name')}
              data-testid="listing-crop-input"
              className="input-field"
              required
            />
            
            <div className="flex gap-2">
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                placeholder={t('quantity')}
                data-testid="listing-quantity-input"
                className="input-field flex-1"
                required
              />
              <select
                value={formData.unit}
                onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                className="input-field w-24"
              >
                <option value="kg">kg</option>
                <option value="quintal">quintal</option>
                <option value="ton">ton</option>
              </select>
            </div>
            
            <input
              type="number"
              value={formData.price_per_unit}
              onChange={(e) => setFormData(prev => ({ ...prev, price_per_unit: e.target.value }))}
              placeholder={`${t('expected_price')} (₹)`}
              data-testid="listing-price-input"
              className="input-field"
            />
            
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder={language === 'hi' ? 'स्थान' : language === 'mr' ? 'स्थान' : 'Location'}
              data-testid="listing-location-input"
              className="input-field"
            />
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 btn-secondary"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={submitting}
                data-testid="save-listing-btn"
                className="flex-1 btn-primary"
              >
                {submitting ? <Loader2 className="animate-spin" size={18} /> : t('save')}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Listings */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#2F6944]" />
        </div>
      ) : displayListings.length > 0 ? (
        <div className="space-y-3 mb-6">
          {displayListings.map((listing, index) => (
            <div 
              key={listing.id}
              className="card stagger-item"
              style={{ animationDelay: `${index * 0.05}s` }}
              data-testid={`listing-${listing.id}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#2F6944]/10 flex items-center justify-center text-[#2F6944]">
                    <Package size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-[#1F2924]">{listing.crop_name}</p>
                    <p className="text-sm text-[#5C7364]">
                      {listing.quantity} {listing.unit}
                    </p>
                  </div>
                </div>
                
                {listing.price_per_unit && (
                  <div className="text-right">
                    <p className="font-bold text-[#2F6944]">₹{listing.price_per_unit}</p>
                    <p className="text-xs text-[#5C7364]">/{listing.unit}</p>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#E4EBE5]">
                <div className="flex items-center gap-2 text-sm text-[#5C7364]">
                  <MapPin size={14} />
                  {listing.location || listing.seller_name}
                </div>
                
                {activeTab === 'my' && (
                  <button
                    onClick={() => handleDeleteListing(listing.id)}
                    data-testid={`delete-listing-${listing.id}`}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[#5C7364] hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12 mb-6" data-testid="no-listings">
          <ShoppingBag size={40} className="mx-auto text-[#E4EBE5] mb-3" />
          <p className="text-[#5C7364]">{t('no_listings')}</p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary mt-4 max-w-[200px] mx-auto"
          >
            <Plus size={18} />
            {t('create_listing')}
          </button>
        </div>
      )}

      {/* Nearby Buyers */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-[#1F2924] mb-3 font-['Outfit'] flex items-center gap-2">
          <TrendingUp size={18} className="text-[#2F6944]" />
          {t('nearby_buyers')}
        </h3>
        <div className="space-y-2">
          {mockBuyers.map((buyer, index) => (
            <div 
              key={buyer.id}
              className="card flex items-center justify-between stagger-item"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F7F9F4] flex items-center justify-center text-[#2F6944] font-semibold">
                  {buyer.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-[#1F2924]">{buyer.name}</p>
                  <p className="text-sm text-[#5C7364] flex items-center gap-1">
                    <MapPin size={12} />
                    {buyer.location}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-amber-500">
                <span>⭐</span>
                <span className="text-sm font-medium">{buyer.rating}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Market Trends */}
      <div className="card bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100">
        <h4 className="font-semibold text-[#1F2924] mb-2 flex items-center gap-2">
          <TrendingUp size={16} className="text-amber-500" />
          {t('market_trends')}
        </h4>
        <p className="text-sm text-[#5C7364]">
          {language === 'hi' 
            ? '📈 टमाटर की कीमतें ऊपर हैं। बेचने का अच्छा समय!'
            : language === 'mr'
            ? '📈 टोमॅटोचे भाव वाढले आहेत. विक्रीसाठी चांगली वेळ!'
            : '📈 Tomato prices are up. Good time to sell!'}
        </p>
      </div>
    </div>
  );
}

export default MarketConnect;
