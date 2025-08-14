from django.contrib import admin
from .models import Tutorial,Session,UserSessionResult,History
admin.site.register(Tutorial)
admin.site.register(Session)
admin.site.register(UserSessionResult)
admin.site.register(History)