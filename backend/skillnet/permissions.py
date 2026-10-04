from rest_framework.permissions import BasePermission,SAFE_METHODS
from .models import User
# Every account management/commands/seed_demo.py creates — the three the homepage's
# "Demo access" buttons sign visitors into directly, plus the other seeded accounts
# (an unverified employer, five sample applicants) that are visible/guessable from
# inside those sessions even though nothing links to them directly. All of them are
# shared by every visitor, not per-visitor copies, so all get the same protection.
DEMO_EMAILS={
    'seeker@skillnet.demo','employer@skillnet.demo','admin@skillnet.demo','provider@skillnet.demo',
    'newcompany@skillnet.demo','nadia.rahman@skillnet.demo','arif.chowdhury@skillnet.demo',
    'mitu.akter@skillnet.demo','kamal.hossain@skillnet.demo','sara.islam@skillnet.demo',
}
def is_demo_user(user): return bool(user and user.is_authenticated and user.email in DEMO_EMAILS)
class BlockDemoDelete(BasePermission):
    """Lets a demo account do everything else, but not hard-delete records —
    otherwise one visitor's test click removes shared seed data (a job, a quiz,
    the one shared demo profile's own education history) for every later visitor."""
    message='This is a shared demo account, so deleting records is disabled.'
    def has_permission(self,request,view):
        return request.method!='DELETE' or not is_demo_user(request.user)
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
