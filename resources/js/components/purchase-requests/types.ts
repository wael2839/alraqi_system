export type PurchaseRequestListItem = {
    id: number;
    material: string;
    specifications: string | null;
    estimated_price: string | null;
    status: string;
    request_date: string | null;
    current_step_id: number | null;
    current_step?: { id: number; step_name: string } | null;
    requester: {
        id: number;
        name: string | null;
        email: string;
        dep_id: number | null;
        department?: { id: number; name: string; name_ar: string } | null;
    } | null;
};

export type WorkflowStepItem = {
    id: number;
    step_number: number;
    step_name: string;
    step_department: string | null;
    required_role: string | null;
};

export type ApprovalHistoryItem = {
    id: number;
    action_by: number | { id: number; name: string } | null;
    action_taken: 'approved' | 'rejected';
    comment: string | null;
    created_at: string;
};

export type PurchaseRequestDetail = PurchaseRequestListItem & {
    pickup_location: string | null;
    current_step?: { id: number; step_name: string; step_number?: number; step_department?: string | null } | null;
    committee_status?: 'pending_members' | 'pending_offers' | 'voting' | 'completed' | null;
    winning_offer_id?: number | null;
};

export type CommitteeMember = {
    id: number;
    user_id: number;
    name: string;
    department: string | null;
    role: 'رئيس' | 'عضو';
    has_voted: boolean;
};

export type PriceOffer = {
    id: number;
    vendor_name: string;
    offer_amount: string | number;
    delivery_period: string | null;
    payment_method: string | null;
    meets_specifications: boolean;
    notes: string | null;
    votes_count: number;
    is_winner: boolean;
};

export type CommitteePermissions = {
    can_select_committee: boolean;
    can_enter_offers: boolean;
    can_vote: boolean;
    can_start_voting: boolean;
};

export type CommitteeData = {
    committee_status: 'pending_members' | 'pending_offers' | 'voting' | 'completed' | null;
    members: CommitteeMember[];
    offers: PriceOffer[];
    winning_offer: {
        id: number;
        vendor_name: string;
        offer_amount: string | number;
    } | null;
    permissions: CommitteePermissions;
    current_user_vote: number | null;
};

export type AvailableUser = {
    id: number;
    name: string;
    department: string | null;
    role: string;
};
