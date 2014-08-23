Yewoo Housing Management System
===========

외주 웹사이트 제작

ucloudbiz 기준 서버 세팅 방법

1. django설치
2. mysql-server 설치
3. mysql 계정 추가/db import
4. MySQLdb(python-mysql interface) 설치
5. django-cron과 관련된 패키지 설치

끝

========
권한 관리
========

1. 기본 레퍼런스
 * [reference1](https://docs.djangoproject.com/en/1.5/ref/contrib/auth/#django-contrib-auth)
 * [reference2](https://docs.djangoproject.com/en/1.5/topics/auth/default/#permissions-and-authorization)

2. 권한 리스트
 * [models.py](buildingApp/models.py)의 UserProfile의 class Meta: 밑에 있음
 * [reference](https://docs.djangoproject.com/en/1.5/topics/auth/customizing/#custom-permissions)를 따라했는데 굳이 UserProfile밑에 권한을 둔 이유는 없음(파일의 제일 위에 있는 class라서...)

3. view 함수에 권한 확인 decorator 달기
 ```
 @permission_required('[AppName].[PermissionName]', login_url='[LoginURL]')
 def [ViewFunctionName](request):
 ```
 [example](https://github.com/playdandi/Yewoo/blob/86eaeaa3098b1b4f14f92c92fb0c538159799ac6/buildingApp/views_04.py#L44-L45):
 ```
 @permission_required('buildingApp.manage_accountinfo', login_url='/login/')
 def accountinfo_html(request):
 ```
 이렇게 하면 해당 view에 연결된 url로 접속시 로그인된 유저가 권한이 없으면 login_url로 넘어감

4. user가 permission이 있는지 확인하는 template tag
 ```
 {% if perms.[AppName].[PermissionName] %}
 ```
 [example](https://github.com/playdandi/Yewoo/blob/86eaeaa3098b1b4f14f92c92fb0c538159799ac6/building/templates/sidebar.html#L59-L63):
 ```
 {% if perms.buildingApp.building_register %}
 <li class="nav-header bordered side-item"><a href="/building/register/">건물 정보 등록</a></li>
 {% else %}
 <li class="nav-header bordered side-item noperm"><a href="/building/register/">건물 정보 등록</a></li>
 {% endif %}
 ```

5. user가 permission이 있는지 확인하는 python code
 ```
 user = User.objects.get(id=[UserId])
 user.has_perm("[AppName].[PermissionName]")
 ```
 리턴 값은 True 혹은 False
 
 [example](https://github.com/playdandi/Yewoo/blob/86eaeaa3098b1b4f14f92c92fb0c538159799ac6/buildingApp/views_04.py#L256-L272):
 ```
 user = User.objects.get(id=1)
 user.perm.append(user.has_perm("buildingApp.building_register"))
 ```

6. user의 permission을 변경하는 python code
 * 특정 유저의 권한을 모두 삭제
  ```
  user = User.objects.get(id=[UserId])
  user.user_permissions.clear()
  ```
  [example](https://github.com/playdandi/Yewoo/blob/86eaeaa3098b1b4f14f92c92fb0c538159799ac6/buildingApp/views_04.py#L215-L216):
  ```
  user = User.objects.get(id=1)
  user.user_permissions.clear()
  ```
 * 특정 권한 추가
  ```
  user = User.objects.get(id=[UserId])
  user.user_permissions.add(Permission.objects.get(codename="[PermissionName]"))
  ```
  [example](https://github.com/playdandi/Yewoo/blob/86eaeaa3098b1b4f14f92c92fb0c538159799ac6/buildingApp/views_04.py#L217-L242):
  ```
  user = User.objects.get(id=[UserId])
  user.user_permissions.add(Permission.objects.get(codename="building_register"))
  ```
  
7. 참고
 * user의 is_superuser flag가 on인 경우 명시적으로 permission을 추가하지 않아도 모든 permission이 있는 것으로 간주
 * django의 기본 permission은 각 model별로 add change delete permission이며 자동 생성됨
 * 
