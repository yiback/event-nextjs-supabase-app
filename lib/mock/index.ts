// Mock 데이터 통합 export
// generators와 data 모듈의 모든 export 통합

// ============================================
// Generators
// ============================================

export {
  generateId,
  generatePastDate,
  generateFutureDate,
  generateProfile,
  generateGroup,
  generateGroupMember,
  generateEvent,
  generateParticipant,
  generateAnnouncement,
  generateNotification,
} from "./generators";

// ============================================
// Static Data
// ============================================

export {
  currentUserId,
  mockProfiles,
  mockGroups,
  mockGroupMembers,
  mockEvents,
  mockParticipants,
  mockAnnouncements,
  mockNotifications,
} from "./data";

// ============================================
// Helper Functions
// ============================================

export {
  getGroupsForUser,
  getMembersForGroup,
  getEventsForGroup,
  getParticipantsForEvent,
  getUpcomingEvents,
  getRecentAnnouncements,
} from "./data";
