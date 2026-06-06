import { sendEmailVerification, reload, User } from 'firebase/auth';

export function getEmailVerificationSettings() {
    if (typeof window === 'undefined') {
        return undefined;
    }

    return {
        url: `${window.location.origin}/login`,
        handleCodeInApp: false,
    };
}

export async function sendVerificationEmail(user: User) {
    await sendEmailVerification(user, getEmailVerificationSettings());
}

export async function refreshEmailVerificationStatus(user: User) {
    await reload(user);
    return user.emailVerified;
}
