from rest_framework.permissions import BasePermission,SAFE_METHODS
from .models import User
class IsRole(BasePermission):
    roles=[]
    def has_permission(self,request,view): return request.user.is_authenticated and request.user.role in self.roles
class IsJobSeeker(IsRole): roles=[User.Role.JOB_SEEKER]
class IsEmployer(IsRole): roles=[User.Role.EMPLOYER]
class IsAdmin(IsRole): roles=[User.Role.ADMIN]
class IsEmployerOrAdmin(IsRole): roles=[User.Role.EMPLOYER,User.Role.ADMIN]
class IsOwnerOrReadOnly(BasePermission):
    def has_object_permission(self,request,view,obj):
        if request.method in SAFE_METHODS:return True
        owner=getattr(obj,'user',None) or getattr(obj,'provider',None) or getattr(obj,'candidate',None)
        return owner==request.user or request.user.role==User.Role.ADMIN
