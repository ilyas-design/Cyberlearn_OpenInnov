import React from 'react';
import {
    Code,
    Network,
    Users,
    BookOpen,
    Lock,
    Shield,
    Database,
    Globe,
    Server,
    Cpu,
    Terminal,
    FileCode,
    AlertTriangle,
    Key
} from 'lucide-react';

// Mapping des noms d'icônes aux composants d'icônes
export const getIconByName = (iconName: string): React.ReactNode => {
    const iconMap: { [key: string]: React.ReactNode } = {
        'Code': <Code />,
        'Network': <Network />,
        'Users': <Users />,
        'BookOpen': <BookOpen />,
        'Lock': <Lock />,
        'Shield': <Shield />,
        'Database': <Database />,
        'Globe': <Globe />,
        'Server': <Server />,
        'Cpu': <Cpu />,
        'Terminal': <Terminal />,
        'FileCode': <FileCode />,
        'AlertTriangle': <AlertTriangle />,
        'Key': <Key />
    };

    return iconMap[iconName] || <BookOpen />;
}; 