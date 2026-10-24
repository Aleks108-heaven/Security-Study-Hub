import sys
def lum(h):
    h=h.lstrip('#'); r,g,b=[int(h[i:i+2],16)/255 for i in (0,2,4)]
    f=lambda c: c/12.92 if c<=0.03928 else ((c+0.055)/1.055)**2.4
    return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b)
def cr(a,b):
    la,lb=lum(a),lum(b); 
    if la<lb: la,lb=lb,la
    return (la+0.05)/(lb+0.05)
L=dict(bg='#ECEFF3',surface='#FFFFFF',surface2='#F4F6F9',ink='#141C26',ink2='#47556A',ink3='#5F6D7E',line='#D3DAE2',accent='#2C4FC7',accentink='#FFFFFF',accentsoft='#E3E9FB',ok='#17663F',okbg='#DDF3E6',warn='#7A4B00',warnbg='#FCEFD0',bad='#A8231B',badbg='#FBE1DE')
Dk=dict(bg='#0C1218',surface='#131B24',surface2='#1A2430',ink='#E8EDF3',ink2='#A8B5C3',ink3='#8C9AAA',line='#263341',accent='#8AA4FF',accentink='#0B1220',accentsoft='#1D2748',ok='#5FD394',okbg='#12301F',warn='#F2BE5C',warnbg='#33270D',bad='#FF9A92',badbg='#3A1816')
pairs=[('ink','bg'),('ink','surface'),('ink2','bg'),('ink2','surface'),('ink2','surface2'),('ink3','bg'),('ink3','surface'),('accent','bg'),('accent','surface'),('accent','accentsoft'),('accentink','accent'),('ok','okbg'),('warn','warnbg'),('bad','badbg'),('ok','surface'),('warn','surface'),('bad','surface'),('ink','accentsoft'),('ink2','accentsoft')]
for name,T in (('light',L),('dark',Dk)):
    print('==',name)
    for a,b in pairs:
        r=cr(T[a],T[b]); print(f'  {a:10s} on {b:10s} {r:5.2f} {"OK" if r>=4.5 else "LOW"}')
    # non-text: line vs surface / focus ring vs bg
    print('  line on surface (needs >=1.2 deco):', round(cr(T['line'],T['surface']),2), ' accent vs bg (focus ring >=3):', round(cr(T['accent'],T['bg']),2), round(cr(T['accent'],T['surface']),2))
