package model

// ListUsersRequest holds the administrator's search and pagination input.
type ListUsersRequest struct {
	Query    string `query:"query"`
	Page     int    `query:"page"`
	PageSize int    `query:"page_size"`
}

// Pagination describes the requested page and number of matching users.
type Pagination struct {
	Page     int   `json:"page"`
	PageSize int   `json:"page_size"`
	Total    int64 `json:"total"`
}

// UserListResponse contains public account fields, never credentials or sessions.
type UserListResponse struct {
	Items      []UserResponse `json:"items"`
	Pagination Pagination     `json:"pagination"`
}

// UpdateUserStatusRequest permits account activation changes only.
type UpdateUserStatusRequest struct {
	Status UserStatus `json:"status"`
}
