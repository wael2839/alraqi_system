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

export type PurchaseRequestDetail = PurchaseRequestListItem & {
    pickup_location: string | null;
    current_step?: { id: number; step_name: string; step_number?: number } | null;
};
