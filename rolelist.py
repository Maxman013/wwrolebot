import random as rd
import sys

args = sys.argv

people = list(range(1, int(args[1]) + 1))
rd.shuffle(people)

neutrals_amount = (len(people)//9)+1+int(args[2]) #take away the +1 or add more to balance out the game
wolves_amount = len(people)//4 +int(args[3])
civilians_amount = len(people) - neutrals_amount - wolves_amount

all_roles_listed = ['civilian'] * civilians_amount + ['neutral'] * neutrals_amount + ['wolf'] * wolves_amount #amount of any faction per game

roles = {
'neutral':{
    'nk': ['serial killer', 'arsonist', 'juggernaut'], #neutral Killing
    'ne': ['crazed chemist', 'jester', 'hangman'], #neutral evil
    'nb': ['amnesiac', 'survivor', 'guardian angel', 'iron hein', 'cupid',
           'lawmaker'], #neutral benign
    'nc': ['pirate', 'plaguebearer'] #neutral chaos
  },
'wolf': {
        'wak': ['big bad wolf', 'white wolf', 'bounty hunter wolf'], #wolf additional killing
        'wop': ['cub', 'plague wolf', 'infectious wolf', 'buzzkill'], #wolf op roles
        'wv': ['shadow wolf', 'protection wolf', 'fraudulent wolf', 'dictator wolf'], #wolf voting roles
        'wa': ['forger wolf', 'consort wolf', 'wise wolf', 'silencer wolf', 'necromancer wolf', 'shaman wolf']
},
'civilian': {
    'ci':  ['investigator', 'detective duo', 'psychic', 'seer'], #civilian information roles
    'cp': ['bodyguard', 'doctor', 'blacksmith', 'crusader', 'trapper'], #civilian protection roles
    'cai': ['spy', 'quizmaster', 'bird spotter', 'tracker', 'innocent girl'], #civilian additional info roles
    'ck': ['veteran', 'vigilante', 'hunter', 'priest' ], #civilian killing roles
    'cj': ['prison guard'], #civilian jailor role
    'cw': ['scratched shepherd', 'cursed one'] + ['1'] *29, #civilian wolf roles
    'cs': ['blocker', 'escort', 'transporter', 'skin changer', 'judge', 
           'retributionist', 'gambler', 'cheater', 'flower girl', 'perfectionist',
           'actor', 'politician'], #civilian support roles
    'sisters' : ['sisters'] + (['1'] * 29)
  }
}
unique_roles = ['pirate', 'plaguebearer', 'white wolf', 'cub', 'plague wolf', 'infectious wolf',
               'scratched shepherd', 'cursed one', 'retributionist', 'shadow wolf',
               'wise wolf', 'big bad wolf', 'veteran', 'quizmaster',
               'escort', 'priest', 'gambler', 'necromancer wolf'
               'prison guard', 'blacksmith', 'bird spotter', 'bounty hunter wolf',
               'dictator wolf', 'protection wolf', 'hunter', 'judge', 'perfectionist', 
               'lawmaker', 'flower girl', 'buzzkill', 'actor', 'politician']

class Player:
    def __init__ (self, faction, role, name):
        self.name=name
        self.faction=faction
        self.role=role

def unique_role(role):
    if role == None:
        return True
    if role in role_assigned and role in unique_roles:
        return True
    return False
            

people_roles = []
for i in range(len(people)):
    temp_faction = all_roles_listed[i]
    people_roles.append(Player(temp_faction, None, people[i]))

role_assigned = []
alignment_assigned = []
for person in people_roles:
    while True:
        specific_alignment = roles[person.faction]
        alignment = rd.sample(specific_alignment.keys(), 1)[0]
        person.role = rd.sample(specific_alignment[alignment], 1)[0]
        
        if unique_role(person.role): pass
        elif alignment in alignment_assigned and alignment in ['cj', 'wak', 'wop', 'cw']: pass
            
        elif person.faction == 'wolf':
            
            if person.role == 'silencer wolf' and role_assigned.count('silencer wolf') == 2: pass
            elif person.role == 'forger wolf' and role_assigned.count('forger wolf') == 2: pass
            elif person.role == 'consort wolf' and role_assigned.count('consort wolf') == 2: pass
            elif person.role == 'fraudulent wolf' and role_assigned.count('fraudulent wolf') == 2: pass
            if person.role == '1': pass
            else: break
        
        elif person.faction == 'neutral':

            #addition of atleast 1 NE role
            if 'ne' not in alignment_assigned:
                alignment = 'ne'
                person.role = rd.sample(specific_alignment[alignment], 1)[0]
                break
                
            if 'nk' not in alignment_assigned:
                alignment = 'nk'
                person.role = rd.sample(specific_alignment[alignment], 1)[0]
                break

            #Putting a max on the amount of NKs in the game
            elif alignment == 'nk' and alignment_assigned.count('nk') == neutrals_amount // 2: pass
            elif alignment == 'ne' and alignment_assigned.count('ne') == neutrals_amount // 2: pass
            elif person.role == 'jester' and role_assigned.count('jester') == 2: pass
            elif person.role == 'hangman' and role_assigned.count('hangman') == 2: pass
            else: break

        elif person.faction == 'civilian':

            #putting in atleast 1 civilian jailor role
            if 'cj' not in alignment_assigned:
                alignment = 'cj'
                person.role = rd.sample(specific_alignment[alignment], 1)[0]
                break

            #putting in atleast 1 ci
            elif 'ci' not in alignment_assigned:
                alignment = 'ci'
                person.role = rd.sample(specific_alignment[alignment], 1)[0]
                break
                                
            elif 'cp' not in alignment_assigned:
                alignment = 'cp'
                person.role = rd.sample(specific_alignment[alignment], 1)[0]
                break
            
            #putting in atleast 2 cai
            elif alignment_assigned.count('cai') <= 1:
                while True:
                    alignment = 'cai'
                    person.role = rd.sample(specific_alignment[alignment], 1)[0]
                    if not unique_role(person.role): break    
                break
                
            double_roles = {
                role_assigned.count('sisters'): 'sisters',
                role_assigned.count('detective duo'): 'detective duo'
            }

            if 1 in double_roles:
                alignment = 'ci' if person.role == 'detective duo' else 'sisters'
                person.role = double_roles[1]
                break
                
            elif person.role == '1': pass    
            elif alignment == 'ck' and alignment_assigned.count('ck') == (civilians_amount // 15) +1: pass
            elif alignment == 'ci' and alignment_assigned.count('ci') == len(people)//15: pass
            elif person.role == 'detective duo' and 'ci' in alignment_assigned: pass
            elif person.role == 'sisters' and role_assigned.count('sisters') == 3: pass
            elif alignment == 'cp' and alignment_assigned.count('cp') == len(people)//10: pass
            elif person.role == 'blocker' and role_assigned.count('blocker') == 2: pass
            elif person.role == 'spy' and role_assigned.count('spy') == 2: pass
            elif person.role == 'doctor' and role_assigned.count('doctor') == 2: pass
            elif person.role == 'bodyguard' and role_assigned.count('bodyguard') == 2: pass
            elif person.role == 'detective duo' and len(role_assigned) == civilians_amount - 1:
                pass
            elif person.role == 'sisters' and len(role_assigned) == civilians_amount - 1:
                pass
            elif alignment == 'cai' and 'detective duo' in role_assigned and alignment_assigned.count('cai') == 3: pass
            elif alignment == 'cai' and 'detective duo' not in role_assigned and alignment_assigned.count('cai') == 2: pass
            elif person.role == 'detective duo' and role_assigned.count(person.role) == 2: pass
            elif person.role == 'blacksmith' and alignment_assigned.count('cp') == (len(people)//10 -1): pass
            elif alignment == 'cp' and 'blacksmith' in role_assigned and alignment_assigned.count('cp') == (len(people)//10 -1):pass
            elif person.role == 'retributionist' and 'blacksmith' in role_assigned and alignment_assigned.count('cp') == (len(people)//10 - 1): pass
            elif alignment == 'ci' and 'detective duo' in role_assigned: pass
            elif alignment == 'cp' and 'retributionist' in role_assigned and alignment_assigned.count('cp') == (len(people)//10 -1): pass
            elif person.role == 'retributionist' and alignment_assigned.count('cp') == (len(people)//10 +1): pass
            elif person.role == 'cheater' and role_assigned.count('cheater') == 2: pass
            elif person.role == 'transporter' and role_assigned.count('transporter') == 2: pass
            elif person.role == 'skinchanger' and role_assigned.count('skinchanger') == 2: pass
            elif person.role == 'quizmaster' and len(people) < 20: pass
            else:break
        else:break

    role_assigned.append(person.role)
    alignment_assigned.append(alignment)

for i in people_roles:
    print(i.name, i.role)