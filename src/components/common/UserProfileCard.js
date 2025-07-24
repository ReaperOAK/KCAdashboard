import React from 'react';
import { 
  StarIcon, 
  LinkIcon, 
  CalendarIcon, 
  PhoneIcon,
  IdentificationIcon,
  AcademicCapIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/solid';

const UserProfileCard = ({ user, showFullDetails = false }) => {
  const fideProfileUrl = user?.fide_id ? `https://ratings.fide.com/profile/${user.fide_id}` : null;
  
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary to-secondary p-6 text-white">
        <div className="flex items-center gap-4">
          {/* Profile Picture */}
          <div className="relative">
            {user?.profile_picture_url ? (
              <img
                src={`/api/${user.profile_picture_url}`}
                alt={`${user.full_name}'s profile`}
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                <IdentificationIcon className="w-10 h-10 text-white/70" />
              </div>
            )}
            
            {/* Verification Badge */}
            {user?.profile_picture_url && (
              <div className="absolute -bottom-1 -right-1">
                <CheckBadgeIcon className="w-6 h-6 text-green-400" />
              </div>
            )}
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-bold">{user?.full_name}</h2>
            <p className="text-white/90 capitalize">{user?.role}</p>
            {user?.role === 'teacher' && user?.experience_years && (
              <p className="text-white/80 text-sm">
                {user.experience_years} years experience
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Chess Information */}
        {(user?.fide_id || user?.fide_rating || user?.national_rating) && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <StarIcon className="w-5 h-5 text-yellow-500" />
              Chess Profile
            </h3>
            
            <div className="space-y-3">
              {user?.fide_id && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">FIDE ID:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{user.fide_id}</span>
                    {fideProfileUrl && (
                      <a
                        href={fideProfileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="View FIDE Profile"
                      >
                        <LinkIcon className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              )}
              
              {user?.fide_rating && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">FIDE Rating:</span>
                  <span className="font-bold text-lg text-primary">{user.fide_rating}</span>
                </div>
              )}
              
              {user?.national_rating && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">National Rating:</span>
                  <span className="font-bold text-lg text-secondary">{user.national_rating}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contact Information */}
        {showFullDetails && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <PhoneIcon className="w-5 h-5 text-blue-500" />
              Contact Information
            </h3>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Email:</span>
                <a href={`mailto:${user?.email}`} className="text-blue-600 hover:underline">
                  {user?.email}
                </a>
              </div>
              
              {user?.phone_number && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <a href={`tel:${user.phone_number}`} className="text-blue-600 hover:underline">
                    {user.phone_number}
                  </a>
                </div>
              )}
              
              {user?.date_of_birth && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Age:</span>
                  <span className="font-medium">{calculateAge(user.date_of_birth)} years</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bio */}
        {user?.bio && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">About</h3>
            <p className="text-gray-600 leading-relaxed">{user.bio}</p>
          </div>
        )}

        {/* Achievements */}
        {user?.achievements && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Achievements</h3>
            <p className="text-gray-600 leading-relaxed">{user.achievements}</p>
          </div>
        )}

        {/* Teacher-specific information */}
        {user?.role === 'teacher' && showFullDetails && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <AcademicCapIcon className="w-5 h-5 text-green-500" />
              Teaching Information
            </h3>
            
            <div className="space-y-2">
              {user?.coaching_since && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Coaching Since:</span>
                  <span className="font-medium">
                    {new Date(user.coaching_since).getFullYear()}
                  </span>
                </div>
              )}
              
              {user?.specializations && (
                <div>
                  <span className="text-gray-600">Specializations:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {JSON.parse(user.specializations).map((spec, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Document Status for Students */}
        {user?.role === 'student' && showFullDetails && (
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Document Status</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Profile Picture:</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  user?.profile_picture_url 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {user?.profile_picture_url ? 'Uploaded' : 'Required'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">DOB Certificate:</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  user?.dob_certificate_url 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {user?.dob_certificate_url ? 'Uploaded' : 'Required'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileCard;
