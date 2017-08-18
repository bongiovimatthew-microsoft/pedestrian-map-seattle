import osmnx as ox 

ox.config(log_file=True, log_console=True, use_cache=True)

# get the walking network for Seattle
G = ox.graph_from_place('Seattle, Washington, USA', network_type='walk')
fig, ax = ox.plot_graph(G)