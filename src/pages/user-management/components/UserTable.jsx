import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';
import { Checkbox } from '../../../components/ui/Checkbox';

const UserTable = ({ users, onEdit, onDelete, onResetPassword, onViewProfile, selectedUsers, onSelectionChange }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: 'Actif', className: 'bg-success/10 text-success border-success/20' },
      inactive: { label: 'Inactif', className: 'bg-muted text-muted-foreground border-border' },
      suspended: { label: 'Suspendu', className: 'bg-warning/10 text-warning border-warning/20' },
      pending: { label: 'En attente', className: 'bg-primary/10 text-primary border-primary/20' }
    };

    const config = statusConfig?.[status] || statusConfig?.inactive;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config?.className}`}>
        {config?.label}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      administrator: { label: 'Administrateur', className: 'bg-error/10 text-error border-error/20' },
      teacher: { label: 'Enseignant', className: 'bg-primary/10 text-primary border-primary/20' },
      student: { label: 'Étudiant', className: 'bg-accent/10 text-accent border-accent/20' },
      parent: { label: 'Parent', className: 'bg-secondary/10 text-secondary border-secondary/20' }
    };

    const config = roleConfig?.[role] || roleConfig?.student;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config?.className}`}>
        {config?.label}
      </span>
    );
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig?.key === key && sortConfig?.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig?.key !== columnKey) {
      return <Icon name="ArrowUpDown" size={14} className="text-muted-foreground" />;
    }
    return sortConfig?.direction === 'asc' 
      ? <Icon name="ArrowUp" size={14} className="text-primary" />
      : <Icon name="ArrowDown" size={14} className="text-primary" />;
  };

  const formatLastLogin = (date) => {
    if (!date) return 'Jamais connecté';
    const now = new Date();
    const loginDate = new Date(date);
    const diffInHours = Math.floor((now - loginDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'À l\'instant';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    if (diffInHours < 168) return `Il y a ${Math.floor(diffInHours / 24)}j`;
    return loginDate?.toLocaleDateString('fr-FR');
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      onSelectionChange(users?.map(user => user?.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectUser = (userId, checked) => {
    if (checked) {
      onSelectionChange([...selectedUsers, userId]);
    } else {
      onSelectionChange(selectedUsers?.filter(id => id !== userId));
    }
  };

  const isAllSelected = users?.length > 0 && selectedUsers?.length === users?.length;
  const isIndeterminate = selectedUsers?.length > 0 && selectedUsers?.length < users?.length;

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="w-12 px-4 py-3">
                <Checkbox
                  checked={isAllSelected}
                  indeterminate={isIndeterminate}
                  onChange={(e) => handleSelectAll(e?.target?.checked)}
                />
              </th>
              <th className="text-left px-4 py-3">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary transition-micro"
                >
                  <span>Utilisateur</span>
                  {getSortIcon('name')}
                </button>
              </th>
              <th className="text-left px-4 py-3">
                <button
                  onClick={() => handleSort('role')}
                  className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary transition-micro"
                >
                  <span>Rôle</span>
                  {getSortIcon('role')}
                </button>
              </th>
              <th className="text-left px-4 py-3">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary transition-micro"
                >
                  <span>Statut</span>
                  {getSortIcon('status')}
                </button>
              </th>
              <th className="text-left px-4 py-3">
                <button
                  onClick={() => handleSort('lastLogin')}
                  className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary transition-micro"
                >
                  <span>Dernière connexion</span>
                  {getSortIcon('lastLogin')}
                </button>
              </th>
              <th className="text-left px-4 py-3">
                <span className="text-sm font-medium text-foreground">Classes/Étudiants</span>
              </th>
              <th className="text-center px-4 py-3 w-32">
                <span className="text-sm font-medium text-foreground">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users?.map((user) => (
              <tr key={user?.id} className="hover:bg-muted/30 transition-micro">
                <td className="px-4 py-4">
                  <Checkbox
                    checked={selectedUsers?.includes(user?.id)}
                    onChange={(e) => handleSelectUser(user?.id, e?.target?.checked)}
                  />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                      <Image
                        src={user?.avatar}
                        alt={user?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">{user?.name}</div>
                      <div className="text-xs text-muted-foreground">{user?.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  {getRoleBadge(user?.role)}
                </td>
                <td className="px-4 py-4">
                  {getStatusBadge(user?.status)}
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-foreground">{formatLastLogin(user?.lastLogin)}</div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-foreground">
                    {user?.associatedData || '-'}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      iconName="Eye"
                      onClick={() => onViewProfile(user)}
                      className="h-8 w-8"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      iconName="Edit"
                      onClick={() => onEdit(user)}
                      className="h-8 w-8"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      iconName="Key"
                      onClick={() => onResetPassword(user)}
                      className="h-8 w-8"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      iconName="Trash2"
                      onClick={() => onDelete(user)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4 p-4">
        {users?.map((user) => (
          <div key={user?.id} className="bg-background border border-border rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Checkbox
                  checked={selectedUsers?.includes(user?.id)}
                  onChange={(e) => handleSelectUser(user?.id, e?.target?.checked)}
                />
                <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
                  <Image
                    src={user?.avatar}
                    alt={user?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">{user?.name}</div>
                  <div className="text-xs text-muted-foreground">{user?.email}</div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Rôle</div>
                {getRoleBadge(user?.role)}
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Statut</div>
                {getStatusBadge(user?.status)}
              </div>
            </div>

            <div className="mb-3">
              <div className="text-xs text-muted-foreground mb-1">Dernière connexion</div>
              <div className="text-sm text-foreground">{formatLastLogin(user?.lastLogin)}</div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="text-xs text-muted-foreground">
                {user?.associatedData || 'Aucune association'}
              </div>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  iconName="Eye"
                  onClick={() => onViewProfile(user)}
                  className="h-8 w-8"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  iconName="Edit"
                  onClick={() => onEdit(user)}
                  className="h-8 w-8"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  iconName="MoreHorizontal"
                  className="h-8 w-8"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Empty State */}
      {users?.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Aucun utilisateur trouvé</h3>
          <p className="text-muted-foreground">Aucun utilisateur ne correspond aux critères de recherche.</p>
        </div>
      )}
    </div>
  );
};

export default UserTable;