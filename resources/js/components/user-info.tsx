import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import type { User } from '@/types';

export function UserInfo({
    user,
    showEmail = false,
    showRoleInfo = true,
}: {
    user: User;
    showEmail?: boolean;
    showRoleInfo?: boolean;
}) {
    const getInitials = useInitials();
    const displayName = user.name ?? user.displayName ?? '';

    return (
        <>
            <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                <AvatarImage src={user.avatar} alt={displayName} />
                <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                    {getInitials(displayName)}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-start text-sm leading-tight">
                <span className="truncate font-medium">{displayName}</span>
                {showEmail && (
                    <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                    </span>
                )}
                {showRoleInfo && (user.department_name || user.role_label) && (
                    <span className="truncate text-xs text-muted-foreground">
                        {user.department_name && user.role_label
                            ? `${user.role_label} - ${user.department_name}`
                            : user.role_label || user.department_name}
                    </span>
                )}
            </div>
        </>
    );
}
